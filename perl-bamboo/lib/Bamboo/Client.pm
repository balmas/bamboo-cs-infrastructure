package Bamboo::Client;
  use Moose;

  use Bamboo::Client::Connection;
  use URI;
  use Data::UUID;

  use POE qw(Component::Client::TCP);

  has _was_setup => ( is => 'rw', default => 0 );

  has url => ( is => 'rw', default => 'http://localhost:3000/demo' );
  has alias => ( is => 'rw', default => 'client' );
  has connection => ( is => 'rw' );
  has _queue => ( is => 'rw', default => sub { [ ] } );
  has _uuid_gen => ( is => 'ro', default => sub { Data::UUID -> new } );

  sub setup {
    my($self) = @_;

    my $uri = URI -> new($self -> url);
    my $ws_uri = $self -> url;
    $ws_uri =~ s/^https?:/ws:/;

    POE::Component::Client::TCP -> new(
      Alias => $self -> alias,
      RemoteAddress => $uri -> host,
      RemotePort => $uri -> port,
      Filter => 'POE::Filter::Stream',
      Connected => sub {
        $self -> connection(Bamboo::Client::Connection -> new(
          server => $_[HEAP]{server},
          url => $ws_uri,
        ));
        $self -> connection -> initiate_handshake;
      },
      ServerInput => sub {
        $self -> connection -> receive($_[ARG0]);
        my $msg;
        while( $msg = $self -> connection -> next ) {
          $_[KERNEL] -> yield('message', $msg);
        }
      },
      Disconnected => sub {
        $_[KERNEL] -> delay( reconnect => 60 );
      },
      InlineStates => {
        message => sub {
          $self -> message($_[ARG0]);
        },
        clear_queue => sub {
          $self -> clear_queue;
        },
      },
    );

    $self -> _was_setup(1);
  }

  sub request {
    my($self, $class, $data, $uuid) = @_;
    $uuid ||= $self -> _uuid_gen -> create_str();
    if( $self -> connection ) {
      $self -> connection -> request({ id => $uuid, class => $class, data => $data });
    }
    else {
      push @{$self -> _queue}, { id => $uuid, class => $class, data => $data };
    }
    return $uuid;
  }

  sub clear_queue {
    my($self) = @_;

    if( $self -> connection ) {
      $self -> request($_->{'class'}, $_->{'data'}, $_->{'id'}) for @{$self -> _queue};
    }
  }

  sub message {
    my($self, $msg) = @_;
    print STDERR "   id: " . $msg -> {id} . "\n";
    print STDERR "class: " . $msg -> {class} . "\n";
  }

  sub run {
    my($self) = @_;

    $self -> setup unless $self -> _was_setup;

    POE::Kernel -> run();
  }

1;

__END__

=head1 NAME

Bamboo::Client - Scaffolding for building a Bamboo client

=head1 SYNOPSIS

 use Bamboo::Client;

 my $client = Bamboo::Client -> new(
   url => 'http://localhost:3000/demo'
 );

 $client -> setup;

 POE::Kernel -> run;

=head1 DESCRIPTION

The Bamboo::Client uses POE to enable asynchronous interaction with the
Bamboo Corpora Space infrastructure.

=head1 EVENTS

Events consist of an event class, event data, and an event id.  The event id
is automatically generated when creating a new event.

Event classes are heirarchical.  For example, a handler for 'foo.bar' will
not receive events for 'foo', but will for 'foo.bar' and 'foo.bar.baz'.

=head2 Event Classes

=over 4

=item declaration.query.done

An event with this class can be sent to declare that no more responses should
be forward by the server for the query associated with the event id.

=back

=head1 SEE ALSO

L<POE>
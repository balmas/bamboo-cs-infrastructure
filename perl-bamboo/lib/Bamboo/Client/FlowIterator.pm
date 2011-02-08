package Bamboo::Client::FlowIterator;
  use Moose;
  extends 'Bamboo::Engine::Iterator';
  use Carp qw(croak);
  use Bamboo::Client::Flow;

  has client => ( is => 'ro', isa => 'Bamboo::Client', weak_ref => 1 );
  has expression => (is => 'ro', isa => 'Str');
  has iterators => (is => 'ro', isa => 'HashRef', default => sub { +{ } });
  has namespaces => (is => 'ro', isa => 'HashRef', default => sub { +{ } } );

  sub invert {
    my($self, $callbacks) = @_;

    my $flow = Bamboo::Client::Flow -> new(
      client => $self -> client,
      expression => $self -> expression,
      iterators => $self -> iterators,
      namespaces => $self -> namespaces,
      next => $callbacks -> {next},
      done => $callbacks -> {done}
    );

    $flow -> create();

    sub { $flow -> run(); };
  }

  sub run {
    my($self) = @_;

    croak "Unable to run flows synchronously for now";
  }

1;

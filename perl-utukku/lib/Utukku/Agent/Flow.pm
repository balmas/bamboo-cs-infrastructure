package Utukku::Agent::Flow;
  use Moose;
  use Utukku::Engine::Parser;
  use Utukku::Engine::Context;
  use Utukku::Agent::FlowIterator;

  has expression => (isa => 'Str', is => 'ro');
  has _expression => (isa => 'Utukku::Engine::Expression', is => 'rw');
  has iterators => (isa => 'ArrayRef', is => 'ro', default => sub { [ ] });
  has _iterators => (isa => 'HashRef', is => 'ro', default => sub { +{ } });
  has namespaces => (isa => 'HashRef', is => 'ro', default => sub { +{ } });
  has id => (isa => 'Str', is => 'ro' );
  has agent => (isa => 'Utukku::Agent', is => 'ro');

  sub start {
    my($self) = @_;

use Data::Dumper;
    my $context = Utukku::Engine::Context -> new;

    for my $i (@{$self -> iterators}) {
      $self -> _iterators -> {$i} = Utukku::Agent::FlowIterator -> new;
      $context -> var($i, $self -> _iterators -> {$i});
    }
    for my $p (keys %{$self -> namespaces}) {
      $context -> ns($p, $self -> namespaces -> {$p});
    }
    my $parser = Utukku::Engine::Parser -> new;
    my $exp = $parser -> parse($context, $self -> expression);

    $exp -> async($context, 0, {
      next => sub {
        $self -> agent -> response('flow.produce', {
          items => [ $_[0] ]
        }, $self -> id);
      },
      done => sub {
        $self -> agent -> response('flow.produced', {}, $self -> id);
      }
    });
  }

  sub provide {
    my($self, $iterators) = @_;

    for my $k ( keys %$iterators ) {
      $self -> _iterators -> {$k} -> push($iterators -> {$k});
    }
  }

  sub provided {
    my($self, $iterators) = @_;

    $self -> _iterators -> {$_} -> done() for @$iterators;
  }

  sub finish {
    my($self) = @_;

    
  }

1;

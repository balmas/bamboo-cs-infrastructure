package Bamboo::Engine::Parser::VariableRef;
  use Moose;
  extends 'Bamboo::Engine::Expression';

  use MooseX::Types::Moose qw( ArrayRef );

  has name => (isa => 'Str', is => 'rw', required => 1);

  sub run {
    my($self, $context, $av) = @_;

    my $v = $context -> var($self -> name);
    return Bamboo::Engine::NullIterator -> new unless defined $v;
    return $v
  }

  sub invert {
    my($self, $context, $av, $callbacks) = @_;

    $self -> run($context, $av) -> invert($callbacks);
  }

1;

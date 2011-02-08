package Bamboo::Engine::Parser::VarSet;
  use Moose;
  extends 'Bamboo::Engine::Expression';

  has 'name' => ( is => 'rw' );
  has 'expr' => ( is => 'rw' );

  sub run {
    my($self, $context, $av) = @_;

    # this should really be a compile-time thing
    $self -> context -> with_context($context, sub {
      my($ctx) = @_;

      $context -> set_var( $self -> name, $self -> expr -> run($ctx, $av) );
    });
    return Bamboo::Engine::NullIterator -> new;
  }

1;


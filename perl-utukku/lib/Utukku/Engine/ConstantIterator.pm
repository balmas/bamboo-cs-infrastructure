package Utukku::Engine::ConstantIterator;
  use Moose;
  extends 'Utukku::Engine::Iterator';

  use MooseX::Types::Moose qw(ArrayRef);

  has values => ( isa => ArrayRef, is => 'ro' );

  sub start {
    my($self) = @_;

    return Utukku::Engine::ConstantIterator::Visitor -> new( iterator => $self );
  }

  sub build_async {
    my($self, $callbacks) = @_;

    sub {
      $callbacks -> {next} -> ($_) for @{$self -> values};
      $callbacks -> {done} -> ();
    }
  }

package Utukku::Engine::ConstantIterator::Visitor;
  use Moose;

  use MooseX::Types::Moose qw(ArrayRef);
  use Utukku::Engine::Types qw(Iterator);

  has iterator => ( isa => Iterator, is => 'ro' );
  has position => ( is => 'rw', default => 0 );
  has value => ( is => 'rw' );
  has past_end => ( is => 'rw', default => 0 );

  sub next {
    my($self) = @_;
    if($self -> at_end) {
      $self -> past_end(1);
      $self -> value(undef);
    }
    else {
      $self->value($self -> iterator -> values -> [$self -> position]);
      $self -> position($self -> position + 1);
    }
    return $self -> value;
  }

  sub at_end {
    my($self) = @_;
    $self -> position > $#{$self -> iterator -> values};
  }

1;

package Utukku::Engine::Type;
  use Moose;
  use MooseX::Types::Moose qw(Str HashRef);

  has 'namespace' => ( isa => Str, is => 'rw' );
  has 'name'      => ( isa => Str, is => 'rw' );
  has 'goings'    => ( isa => HashRef, is => 'rw', default => sub { +{ } } );
  has 'comings'   => ( isa => HashRef, is => 'rw', default => sub { +{ } } );
  has 'methods'   => ( isa => HashRef, is => 'rw', default => sub { +{ } } );

  our %types;

  #
  # This 'around new' makes sure we have a single object per type
  #
  # Having one object per type allows us to compare references
  # instead of comparing information in the object
  #
  # serialization will need to ensure we can bring them in from storage
  # while maintaining this semantic
  #
  around new => sub {
    my $orig  = shift;
    my $class = shift;
    my %args  = @_;

    my $fn = join("", @args{qw(namespace name)});

    $Utukku::Engine::Type::types{$fn} ||= $class->$orig(@_);
  };

1;

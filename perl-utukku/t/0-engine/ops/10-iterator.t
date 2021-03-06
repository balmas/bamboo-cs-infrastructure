#!perl -T

use Test::More tests => 178;
use Data::Dumper;

use Utukku::Engine::Iterator;
use Utukku::Engine::NullIterator;
use Utukku::Engine::ConstantIterator;
use Utukku::Engine::ConstantRangeIterator;
use Utukku::Engine::RangeIterator;
use Utukku::Engine::SetIterator;
use Utukku::Engine::FilterIterator;
use Utukku::Engine::MapIterator;
use Utukku::Engine::UnionIterator;

use Utukku::Engine::Parser::Literal;
use Utukku::Engine::Context;

sub test_iterator_inversion {
  my($iterator, $results, $text) = @_;

  my @results = ();
  $iterator -> async({
    'next' => sub { push @results, $_[0] },
    'done' => sub { is_deeply(\@results, $results, $text) }
  });

}

sub test_expression_inversion {
  my($expression, $results, $text) = @_;

  my $dummy_context = Utukku::Engine::Context -> new();

  test_iterator_inversion($expression -> run($dummy_context), $results, $text);
}

for my $type (qw(Set Constant Range ConstantRange Union Null Filter Map)) {
  can_ok("Utukku::Engine::${type}Iterator", qw( new ));
  can_ok("Utukku::Engine::${type}Iterator", qw( start async ));
  can_ok("Utukku::Engine::${type}Iterator::Visitor", qw( next at_end position ));
}

my $iterator = new_ok( 'Utukku::Engine::ConstantIterator', [
  values => [ qw(a b c) ] 
] );

my $visitor = $iterator -> start;

ok($visitor);

is($visitor -> position, 0, "Initial position should be zero");

is($visitor -> next, 'a');
is($visitor -> position, 1);
ok(!$visitor -> at_end);
is($visitor -> next, 'b');
is($visitor -> position, 2);
ok(!$visitor -> at_end);
is($visitor -> next, 'c');
is($visitor -> position, 3);
ok($visitor -> at_end);
ok(!defined($visitor -> next));
is($visitor -> position, 3);
ok($visitor -> at_end);

test_iterator_inversion( $iterator, [ qw(a b c) ] );

my $literal = new_ok( 'Utukku::Engine::Parser::Literal', [
  value => 'a' 
] );

ok($literal);

my $dummy_context = undef;

my $lit_it = $literal -> run($dummy_context);

ok($lit_it);

my $lit_it_vis = $lit_it -> start;

is($lit_it_vis -> position, 0);
is($lit_it_vis -> next, 'a');
is($lit_it_vis -> position, 1);
ok($lit_it_vis -> at_end);

test_expression_inversion($literal, [ 'a' ]);

my $combo = new_ok( 'Utukku::Engine::SetIterator', [
  sets => [ Utukku::Engine::ConstantIterator -> new( values => [ 1, 2, 3 ] ),
            Utukku::Engine::ConstantIterator -> new( values => [ 2, 4, 6 ] )
          ],
  combinator => sub { my($a, $b) = @_; return $a * $b }
] );

ok($combo);

my $combos = $combo -> start;

ok($combos);
is($combos -> position, 0);
is($combos -> next, 2);
is($combos -> position, 1);
is($combos -> next, 4);
is($combos -> position, 2);
is($combos -> next, 6);
is($combos -> position, 3);
is($combos -> next, 4);
is($combos -> position, 4);
is($combos -> next, 8);
is($combos -> position, 5);
is($combos -> next, 12);
is($combos -> position, 6);
is($combos -> next, 6);
is($combos -> position, 7);
is($combos -> next, 12);
is($combos -> position, 8);
is($combos -> next, 18);
is($combos -> position, 9);
ok($combos -> at_end);
ok(!$combos -> past_end);
is($combos -> next, undef);
ok($combos -> past_end);

my $range_it = Utukku::Engine::ConstantRangeIterator -> new(
  begin => 10,
  end   => 14
);

my $rv = $range_it -> start;

is($rv -> next, 10);
is($rv -> next, 11);
is($rv -> next, 12);
is($rv -> next, 13);
is($rv -> next, 14);
is($rv -> position, 5);
ok($rv -> at_end);
ok(!$rv -> past_end);

$range_it = Utukku::Engine::ConstantRangeIterator -> new(
  begin => 14,
  end   => 10
);

$rv = $range_it -> start;

is($rv -> next, 14);
is($rv -> next, 13);
is($rv -> next, 12);
is($rv -> next, 11);
is($rv -> next, 10);
is($rv -> position, 5);
ok($rv -> at_end);
ok(!$rv -> past_end);

$range_it = Utukku::Engine::RangeIterator -> new(
  begin => Utukku::Engine::ConstantRangeIterator -> new(
    begin => 1,
    end   => 3
  ),
  end => Utukku::Engine::ConstantRangeIterator -> new(
    begin => 4,
    end   => 5
  ),
);

$rv = $range_it -> start;

is($rv -> next, 1);
is($rv -> next, 2);
is($rv -> next, 3);
is($rv -> next, 4);
is($rv -> next, 2);
is($rv -> next, 3);
is($rv -> next, 4);
is($rv -> next, 3);
is($rv -> next, 4);
is($rv -> next, 1);
is($rv -> next, 2);
is($rv -> next, 3);
is($rv -> next, 4);
is($rv -> next, 5);
is($rv -> next, 2);
is($rv -> next, 3);
is($rv -> next, 4);
is($rv -> next, 5);
is($rv -> next, 3);
is($rv -> next, 4);
is($rv -> next, 5);
is($rv -> position, 21);
ok($rv -> at_end);

my $union_it = Utukku::Engine::UnionIterator -> new(
  iterators => [
    Utukku::Engine::ConstantRangeIterator -> new(
      begin => 1,
      end => 3,
    ),
    Utukku::Engine::ConstantRangeIterator -> new(
      begin => 7,
      end => 9,
    ),
  ]
);

my $uv = $union_it -> start;

is($uv -> next, 1);
is($uv -> next, 2);
is($uv -> next, 3);
is($uv -> next, 7);
is($uv -> next, 8);
is($uv -> next, 9);
is($uv -> position, 6);
ok($uv -> at_end);

my $null_it = new_ok( 'Utukku::Engine::NullIterator' );

my $null_visitor = $null_it -> start;

ok($null_visitor);

is($null_visitor -> position, 0);
ok($null_visitor -> at_end);
ok($null_visitor -> past_end);

my $filter_it = new_ok( 'Utukku::Engine::FilterIterator', [
  iterator => Utukku::Engine::ConstantRangeIterator -> new(
                begin => 1, end => 100
              ),
  filter => sub { $_[0] % 11 == 0 }
]);

my $filter_visitor = $filter_it -> start;

ok($filter_visitor);

is($filter_visitor -> position, 0);
is($filter_visitor -> next, 11);
is($filter_visitor -> position, 1);
is($filter_visitor -> next, 22);
is($filter_visitor -> position, 2);
is($filter_visitor -> next, 33);
is($filter_visitor -> position, 3);
is($filter_visitor -> next, 44);
is($filter_visitor -> next, 55);
is($filter_visitor -> next, 66);
is($filter_visitor -> next, 77);
is($filter_visitor -> next, 88);
is($filter_visitor -> next, 99);
is($filter_visitor -> position, 9);
ok($filter_visitor -> at_end);
is($filter_visitor -> next, undef);
ok($filter_visitor -> past_end);

my $map_it = new_ok( 'Utukku::Engine::MapIterator', [
  iterator => Utukku::Engine::ConstantRangeIterator -> new(
                begin => 1, end => 5
              ),
  mapping  => sub { $_[0] * $_[0] }
]);

my $map_visitor = $map_it -> start;

ok($map_visitor);

is($map_visitor -> position, 0);
is($map_visitor -> next, 1);
is($map_visitor -> position, 1);
is($map_visitor -> next, 4);
is($map_visitor -> position, 2);
is($map_visitor -> next, 9);
is($map_visitor -> position, 3);
is($map_visitor -> next, 16);
is($map_visitor -> next, 25);
is($map_visitor -> position, 5);
ok($map_visitor -> at_end);
is($map_visitor -> next, undef);
ok($map_visitor -> past_end);

$map_it = Utukku::Engine::MapIterator -> new(
  iterator => Utukku::Engine::ConstantRangeIterator -> new(
                begin => 1, end => 5, incr => 2
              ),
  mapping => sub { Utukku::Engine::ConstantRangeIterator -> new( begin => 1, end => $_[0] ) }
);

$map_visitor = $map_it -> start;

ok($map_visitor);

is($map_visitor -> position, 0);
is($map_visitor -> next, 1);
is($map_visitor -> next, 1);
is($map_visitor -> next, 2);
is($map_visitor -> next, 3);
is($map_visitor -> next, 1);
is($map_visitor -> next, 2);
is($map_visitor -> next, 3);
is($map_visitor -> next, 4);
is($map_visitor -> next, 5);
is($map_visitor -> position, 9);
ok($map_visitor -> at_end);
is($map_visitor -> next, undef);
ok($map_visitor -> past_end);


### now test inversion

my $inv_it = Utukku::Engine::ConstantRangeIterator -> new(
  begin => 1,
  end => 5
);

test_iterator_inversion($inv_it, [ 1, 2, 3, 4, 5 ]);


$inv_it = Utukku::Engine::RangeIterator -> new(
  begin => Utukku::Engine::ConstantRangeIterator -> new(
    begin => 1, end => 3
  ),
  end => Utukku::Engine::ConstantRangeIterator -> new(
    begin => 5, end => 7
  )
);

test_iterator_inversion($inv_it, [
    1, 2, 3, 4, 5,
    1, 2, 3, 4, 5, 6,
    1, 2, 3, 4, 5, 6, 7,
       2, 3, 4, 5,
       2, 3, 4, 5, 6,
       2, 3, 4, 5, 6, 7,
          3, 4, 5,
          3, 4, 5, 6,
          3, 4, 5, 6, 7,
  ]);


$inv_it = Utukku::Engine::MapIterator -> new(
  iterator => Utukku::Engine::ConstantRangeIterator -> new(
                begin => 1, end => 5
              ),
  mapping  => sub { $_[0] * $_[0] }
);

test_iterator_inversion($inv_it, [1, 4, 9, 16,25]);

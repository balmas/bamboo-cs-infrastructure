require 'bamboo/engine/iterator'

class Bamboo::Engine::UnionIterator < Bamboo::Engine::Iterator
  def initialize(iterators)
    @iterators = iterators
  end

  def start
    UnionIterator::Visitor.new(@iterators)
  end

  def invert(callbacks)
    done = 0
    next_callbacks = {
      :next => callbacks[:next],
      :done => proc {
        done += 1
        if done >= @iterators.length
          callbacks[:done].call()
        end
      }
    }

    inits = @iterators.collect{ |i| i.invert(next_callbacks) }

    # we could call these in parallel
    proc {
      inits.each { |i| i.call() }
    }
  end

  class Visitor < Bamboo::Engine::Iterator::Visitor
    def initialize(its)
      @iterators = its.collect { |i| i.start }
      @value = nil
      @position = 0
      @past_end = false
    end

    def at_end?
      @iterators.empty?
    end

    def past_end?
      @past_end
    end

    def next
      if self.at_end?
        @value = nil
        @past_end = true
      else
        @value = @iterators.first.next
        if @iterators.first.at_end?
          @iterators.shift
        end
        @position += 1
      end
      @value
    end
  end
end
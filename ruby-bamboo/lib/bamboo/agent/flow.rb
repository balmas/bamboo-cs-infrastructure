require 'bamboo/engine/parser'
require 'bamboo/engine/context'
require 'bamboo/agent/flow_iterator'

class Bamboo::Agent::Flow
  def initialize(agent, data, msg_id)
    @expression = data['expression']
    @iterators = data['iterators']
    @namespaces = data['namespaces']
    @msg_id = msg_id
    @agent = agent

    @context = Bamboo::Engine::Context.new

    @namespaces.each_pair do |p,h|
      @context.set_ns(p,h)
    end

    @iterator_objs = { }
    @iterators.each do |i|
      @iterator_objs[i] = Bamboo::Agent::FlowIterator.new
      @context.set_var(i, @iterator_objs[i])
    end

    parser = Bamboo::Engine::Parser.new

    @parsed_expr = parser.parse(@expression, @context)
  end

  def start
    subs = @parsed_expr.async(@context, false, {
      :next => proc { |v|
puts "returning #{v}"
        @agent.response('flow.produce', {
          'items' => [ v ]
        }, @msg_id)
      },
      :done => proc {
        @agent.response('flow.produced', {}, @msg_id)
      }
    })
    if subs.is_a?(Array)
      subs.each { |s| s.call() }
    else
      subs.call()
    end
  end

  def provide(iterators)
    iterators.each_pair do |i,v|
      @iterator_objs[i].push(@context.root.anon_node(v))
    end
  end

  def provided(iterators)
    iterators.each do |i|
      @iterator_objs[i].done
    end
  end

  def finish

  end
end

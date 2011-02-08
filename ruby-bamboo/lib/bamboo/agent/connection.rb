require 'web_socket'
require 'json'

module Bamboo
  class Agent
    class Connection

  attr_accessor :url, :namespaces

  def initialize(url = nil)
    @url = url
    @frames = [ ]
    @namespaces = [ ]
  end

  def connect(&block)
    @client = WebSocket.new(@url)
    if !@namespaces.empty?
      self.send({
        'class' => 'flow.namespaces.register',
        'data' => Bamboo::Engine::TagLib::Registry.instance.describe_namespaces( @namespaces )
      })
    end
    @reader = Thread.new() do
      while data = @client.receive()
        if block
          yield JSON.parse(data)
        else
          @frames.push JSON.parse(data)
        end
      end
    end
  end

  def next
    @frames.shift
  end

  def send(data)
    @client.send(data.to_json)
  end

  def close(immediate = false)
    @reader.kill if @reader && immediate
    @reader.join if @reader
  end

    end
  end
end

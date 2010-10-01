require 'sinatra'
require File.exists?('spec/runner.rb') ? 'spec/runner.rb' : 'runner.rb'

run Sinatra::Application

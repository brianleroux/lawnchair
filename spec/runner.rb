require 'rubygems'
require 'sinatra'

set :root, File.dirname(__FILE__)
set :public, '/'

#get '/' do
  #f = File.join(__FILE__.gsub('runner.rb',''), 'adaptors', 'gears.html')
  #IO.readlines(f,'').to_s
  #return 'testing'
#end 
%w(rubygems sinatra).each { |x| require x  }

set :root, File.dirname(__FILE__)

get '/' do
  redirect('/index.html')
end 

get '/src/*' do
  f = File.join(File.dirname(__FILE__), '..', 'src', params['splat'].first)
  IO.readlines(f,'').to_s
end 
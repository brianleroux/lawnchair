LIBPATH = File.expand_path(File.dirname(__FILE__))

desc 'minify the javascript'
task :default do
  puts 'minifying js'
  min_file = File.join(LIBPATH, 'lib', 'lawnchair-min.js')
  src_file = File.join(LIBPATH, 'src', 'lawnchair.js')
  yui_jar  = File.join(LIBPATH, 'util', 'yuicompressor-2.3.6.jar')
  sh "java -jar #{yui_jar} --charset UTF-8 -o #{min_file} #{src_file}"
end
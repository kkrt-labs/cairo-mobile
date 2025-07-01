Pod::Spec.new do |s|
  s.name           = 'NoirProveKit'
  s.version        = '1.0.0'
  s.summary        = 'Native module for Noir ProveKit'
  s.description    = 'Native module for Noir ProveKit'
  s.author         = 'KKRT Labs'
  s.homepage       = 'https://github.com/worldfnd/ProveKit/tree/main'
  s.platforms      = {
    :ios => '15.1',
    :tvos => '15.1'
  }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
  s.vendored_libraries = 'rust/libnoir_provekit.a'
end

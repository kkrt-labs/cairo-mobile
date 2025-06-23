Pod::Spec.new do |s|
  s.name           = 'CairoMBindings'
  s.version        = '1.0.0'
  s.summary        = 'Native module for Cairo M'
  s.description    = 'Native module for Cairo M'
  s.author         = 'KKRT Labs'
  s.homepage       = 'https://github.com/kkrt-labs/cairo-m'
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
  s.vendored_libraries = 'rust/libcairo_m_runner.a'
end

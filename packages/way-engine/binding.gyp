{
  "targets": [
    {
      "target_name": "native_math",
      "sources": [ "src/addon.cc", "src/core.cc" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      "conditions": [
        [ 'OS=="mac"', {
          "xcode_settings": {
            "OTHER_CPLUSPLUSFLAGS": [ "-std=c++17", "-fexceptions" ]
          }
        }],
        [ 'OS=="linux" or OS=="win"', {
          "cflags_cc": [ "-std=c++17", "-fexceptions" ]
        }]
      ],
      "include_dirs": [
        "<!(node -e \"process.stdout.write(require('node-addon-api').include.replace(/^\\\"|\\\"$/g, ''))\")"
      ],
      "defines": [ "NAPI_CPP_EXCEPTIONS" ]
    }
  ]
}
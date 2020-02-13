import React, {useCallback, useState} from 'react'
import WavEncoder from 'wav-encoder'
import { Button } from 'antd'
import './App.css'

import 'antd/dist/antd.css'

import { useDropzone } from 'react-dropzone'
const WaveFile = require('wavefile').WaveFile

function Dropzone() {
  const [isPass, validationSize] = useState(false);
  const [isHaveFile, getFile] = useState(false);
  let isClicked = false

  const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
  
  const onDrop = useCallback(async acceptedFiles => {
    getFile(true)
    if (acceptedFiles[0].size <= 90000) {
      validationSize(true)
    } else {
      validationSize(false)
    }
    let base64_string = await toBase64(acceptedFiles[0])
    document.getElementById('predict_source')
    .setAttribute(
        'src', base64_string
    )
    document.getElementById('result_source')
    .setAttribute(
        'src', ''
    )
  }, [])
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: 'audio/wav'
  })

  return (
    <>
      <div {...getRootProps()} style={{marginBottom: 10}}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop some files here, or click to select files</p>
      </div>
      {
        <audio id="predict_source" controls>
          Your browser does not support the audio element.
        </audio>
      }
      <div style={{height: 20, marginTop: 10, fontSize: 14, color: 'red'}}>
        {
          (!isPass && isHaveFile) && "Vui lòng sử dụng file có kích thước nhỏ hơn 90 kb" 
        }
      </div>
      {
        <audio id="result_source" controls>
          Your browser does not support the audio element.
        </audio>
      }
      {
        <Button 
          type="primary"
          id="predict_button"
          style={{ marginTop: 20, display: isPass ? 'inline' : 'none' }}
          onClick={() => {
            if (!isClicked) {
              isClicked = true
              const go = new window.Go()
              WebAssembly.instantiateStreaming(fetch("main.wasm"), go.importObject).then(async (result) => {
                await go.run(result.instance)
                let audio_array = []
                window.result.split(',').forEach((item) => {
                  audio_array.push(parseFloat(item))
                })
                const audio = {
                  sampleRate: 16000,
                  channelData: [
                    new Float32Array(audio_array)
                  ]
                }
                WavEncoder.encode(audio).then((buffer) => {
                  let byte_buffer = new Buffer(buffer)
                  let wav = new WaveFile(byte_buffer)
                  let wavDataURI = wav.toDataURI()
                  document.getElementById('result_source').setAttribute(
                    'src', wavDataURI
                  )
                })
                isClicked = false
              })
            }
          }}
        >
          Predict
        </Button>
      }
    </>
  )
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Dropzone />
      </header>
    </div>
  );
}

export default App;

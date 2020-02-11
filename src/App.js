import React, {useCallback} from 'react'
import WavEncoder from 'wav-encoder'
import { Progress, Button } from 'antd'
import './App.css'

import 'antd/dist/antd.css'

import { useDropzone } from 'react-dropzone'
const WaveFile = require('wavefile').WaveFile

function Dropzone() {

  const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })

  const onDrop = useCallback(async acceptedFiles => {
    let base64_string = await toBase64(acceptedFiles[0])
    console.log("base64_string ", base64_string)
    document.getElementById('predict_source')
    .setAttribute(
        'src', base64_string
    )
    document.getElementById('predict_button').style.display = "inline"
  }, [])
  const { getRootProps, getInputProps } = useDropzone({onDrop})

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
      <div style={{height: 50, width: 300, marginTop: 10}}>
        <Progress percent={0} />
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
          style={{ display: 'none', marginTop: 10 }}
          onClick={() => {
            WebAssembly.instantiateStreaming(fetch("main.wasm"), window.go.importObject).then(async (result) => {
              await window.go.run(result.instance)
              let audio_array = []
              window.result.split(',').forEach((item) => {
                audio_array.push(parseFloat(item))
              })
              console.log("audio_array ", audio_array)
              const audio = {
                sampleRate: 16000,
                channelData: [
                  new Float32Array(audio_array)
                ]
              }
              WavEncoder.encode(audio).then((buffer) => {
                let byte_buffer = new Buffer(buffer)
                console.log('buffer ', byte_buffer)

                let wav = new WaveFile(byte_buffer)
                console.log(wav.container)
                console.log(wav.chunkSize)
                console.log(wav.fmt.chunkId)
                let wavDataURI = wav.toDataURI()
                document.getElementById('result_source').setAttribute(
                  'src', wavDataURI
                )
              })
            })
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

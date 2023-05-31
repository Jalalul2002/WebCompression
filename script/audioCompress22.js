//Function to Compress
function compressAudio(inputBuffer) {
    
    //audio context
    const audioContext = new (window.AudioContext || window.webkitAudioContext ||window.webkitAudioContext)();

    //audio buffer source
    const audioSource = audioContext.createBufferSource();
    audioSource.buffer = inputBuffer;

    //compressor node
    const compressor = audioContext.createDynamicsCompressor();

    //set compression parameters
    compressor.threshold.value = -24; //dB
    compressor.knee.value = 30; //Jumlah kompresi diterapkan
    compressor.ratio.value = 12; //rasio kompresi
    compressor.attack.value = 0.003; //waktu attack dalam detik
    compressor.release.value = 0.25; //waktu release dalam detik

    //koneksi node audio
    audioSource.connect(compressor);
    compressor.connect(audioContext.destination);

    //start audio source
    audioSource.start();

    //audio buffer to store compressed data
    const outputBuffer = audioContext.createBuffer(
        inputBuffer.numberOfChannels,
        inputBuffer.length,
        inputBuffer.sampleRate
    );

    //looping compressor
    for (let channel = 0; channel < inputBuffer.numberOfChannels; channel++) {
        const inputData = inputBuffer.getChannelData(channel);
        const outputData = outputBuffer.getChannelData(channel);

        for (let i = 0; i < inputData.length; i++) {
            outputData[i] = inputData[i] - compressor.threshold.value;
        }
    }

    return outputBuffer;
}

//handle file input
document.getElementById('inputAudio').addEventListener('change', function (event) { 
    const file = event.target.files[0];

    //file reader
    const reader = new FileReader();

    reader.onload = function (e) {
        const audioData = e.target.result;

        //decode audio data
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioContext.decodeAudioData(audioData, function (buffer) {
            //compress audio data
            const compressedBuffer = compressAudioData(buffer);

            //blob untuk compressed buffer
            audioContext.createBufferSource().buffer = compressedBuffer;
            audioContext.startRendering().then(function (renderedBuffer) {
                const audioBlob = new Blob([renderedBuffer]);

                //download link
                const downloadLink = document.createElementById('downloadLink');
                downloadLink.href = URL.createObjectURL(audioBlob);
                downloadLink.download = 'compressed_audio.wav';
                downloadLink.style.display = 'block';
            });
        });
    };

    //read file ass array buffer
    reader.readAsArrayBuffer(file);
});

//handle compress button click
document.getElementById('compressAudio').addEventListener('click', function() {
    
});

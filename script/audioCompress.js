document.getElementById('compressAudio').addEventListener('click', function() {
    // Membuat AudioContext
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Mengambil sumber audio (misalnya dari elemen audio HTML)
    const audioElement = document.getElementById('inputAudio');
    const sourceNode = audioContext.createMediaElementSource(audioElement);

    // Membuat node kompressor
    const compressorNode = audioContext.createDynamicsCompressor();

    // Mengatur parameter kompresor
    compressorNode.threshold.value = -24; // Ambang batas kompresi dalam desibel
    compressorNode.knee.value = 30; // Lebar range transisi antara tidak terkompresi ke terkompresi
    compressorNode.ratio.value = 12; // Rasio kompresi
    compressorNode.attack.value = 0.003; // Waktu respons kompresi (attack time) dalam detik
    compressorNode.release.value = 0.25; // Waktu pemulihan kompresi (release time) dalam detik

    // Menghubungkan node-node audio
    sourceNode.connect(compressorNode);
    compressorNode.connect(audioContext.destination);

    // Menggunakan OfflineAudioContext untuk membuat versi terkompresi dari file audio
    const offlineContext = new OfflineAudioContext({
        numberOfChannels: 2,
        length: audioContext.sampleRate * audioElement.duration,
        sampleRate: audioContext.sampleRate
    });

    // Menghubungkan node-node audio ke dalam OfflineAudioContext
    sourceNode.connect(compressorNode);
    compressorNode.connect(offlineContext.destination);

    // Memulai proses rendering audio
    offlineContext.startRendering();

    // Setelah proses rendering selesai
    offlineContext.oncomplete = function(event) {
        const compressedBuffer = event.renderedBuffer;

        // Membuat audio buffer baru dengan format yang dapat diunduh (misalnya, WAV)
        const audioBlob = bufferToWaveBlob(compressedBuffer);

        // Membuat URL objek untuk mengunduh file audio
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(audioBlob);
        downloadLink.download = 'compressed_audio.wav'; // Nama file yang akan diunduh

        // Menambahkan tautan unduhan ke elemen HTML
        document.body.appendChild(downloadLink);

        // Simulasi klik pada tautan untuk memulai unduhan
        downloadLink.click();

        // Menghapus tautan unduhan setelah selesai
        document.body.removeChild(downloadLink);
    };

    // Memainkan audio
    audioElement.play();

    // Fungsi untuk mengubah buffer audio menjadi blob file audio WAV
    function bufferToWaveBlob(buffer) {
    const numberOfChannels = buffer.numberOfChannels;
    const length = buffer.length;
    const sampleRate = buffer.sampleRate;
    const format = "WAVE";
    const bitDepth = 16;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numberOfChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = length * blockAlign;

    const headerSize = 44;
    const fileSize = headerSize + dataSize - 8;

    const bufferView = new ArrayBuffer(headerSize + dataSize);
    const dataView = new DataView(bufferView);

    // Fungsi untuk menulis string sebagai little-endian
    function writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }

    // Chunk "RIFF" identifier
    writeString(dataView, 0, "RIFF");

    // Chunk size (file size - 8)
    dataView.setUint32(4, fileSize - 8, true);

    // Format "WAVE" identifier
    writeString(dataView, 8, "WAVE");

    // Subchunk "fmt " identifier
    writeString(dataView, 12, "fmt ");

    // Subchunk size (16 for PCM)
    dataView.setUint32(16, 16, true);

    // Audio format (PCM = 1)
    dataView.setUint16(20, 1, true);

    // Number of channels
    dataView.setUint16(22, numberOfChannels, true);

    // Sample rate
    dataView.setUint32(24, sampleRate, true);

    // Byte rate (sample rate * block align)
    dataView.setUint32(28, byteRate, true);

    // Block align (number of channels * bytes per sample)
    dataView.setUint16(32, blockAlign, true);

    // Bits per sample
    dataView.setUint16(34, bitDepth, true);

    // Subchunk "data" identifier
    writeString(dataView, 36, "data");

    // Subchunk size (data size)
    dataView.setUint32(40, dataSize, true);

    // Copy audio data to buffer
    for (let channel = 0; channel < numberOfChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        const channelOffset = headerSize + channel * bytesPerSample;

        for (let i = 0; i < length; i++) {
            const sample = Math.max(-1, Math.min(1, channelData[i]));
            const sampleValue = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
            dataView.setInt16(channelOffset + i * blockAlign, sampleValue, true);
        }
    }

    return new Blob([dataView], { type: 'audio/wav' });
    }

});
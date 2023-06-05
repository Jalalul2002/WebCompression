if ("webkitSpeechRecognition" in window) {

    //innisialisasi webkit speech
    let speechRecog = new webkitSpeechRecognition();

    let final_transcript = "";
    
    //properties untuk objek speechRecognition
    speechRecog.continuous = true;
    speechRecog.interimResults = true;
    speechRecog.lang = 'id';

    speechRecog.onstart = () => {
        document.getElementById("status").style.display = "block";
    };
    speechRecog.onend = () => {
        document.getElementById("status").style.display = "none";
    };
    speechRecog.onError = () => {
        document.getElementById("status").style.display = "none";
    };

    speechRecog.onresult = (event) => {
        // buat nterim lokal untuk menghindari transkrip yang bertumpuk
        let interim_transcript = "";
        
        // looping result
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            // jika result is Final, add it to Final Transcript, Else add it to Interim transcript
            if (event.results[i].isFinal) {
                final_transcript += event.results[i][0].transcript;
            } else {
                interim_transcript += event.results[i][0].transcript;
            }
        }

        // Set Final franscript dan Interim transcript.
        document.getElementById("final").innerHTML = final_transcript;
        document.getElementById("interim").innerHTML = interim_transcript;

        // Download transcript as text file
        document.getElementById("download").onclick = () => {
            downloadTranscript(final_transcript);
        };
        
        function downloadTranscript(transcript) {
            // Create BLOB transcript text
            const blob = new Blob([transcript], { type: "text/plain" });

            const anchor = document.createElement("a");
            anchor.href = URL.createObjectURL(blob);
            anchor.download = "transcript.txt";
            anchor.style.display = "none";
            document.body.appendChild(anchor);
            anchor.click();

            // Clean up
            document.body.removeChild(anchor);
            URL.revokeObjectURL(anchor.href);
        }
    };

    document.getElementById("start").onclick = () => {
        speechRecog.start();
    };

    document.getElementById("stop").onclick = () => {
        speechRecog.stop();
    };
}

else {
    console.log("Speech Recognition Not Available")
}
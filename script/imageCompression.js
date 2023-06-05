// Ukuran dan Tipe MIME
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;
const MIME_TYPE = "image/jpeg";
const QUALITY = 0.7;

const input = document.getElementById("imageInput");
input.onchange = function (ev) {
  const file = ev.target.files[0]; // get the file
  const blobURL = URL.createObjectURL(file); // URL BLOB
  const img = new Image();
  img.src = blobURL;
  img.onerror = function () {
    URL.revokeObjectURL(this.src); //Clean BLOB
    // Log Eror
    console.log("Cannot load image");
  };
  img.onload = function () {
    URL.revokeObjectURL(this.src);
    const [newWidth, newHeight] = calculateSize(img, MAX_WIDTH, MAX_HEIGHT);
    const canvas = document.createElement("canvas"); // canvas image hasil kompres
    canvas.width = newWidth;
    canvas.height = newHeight;
    canvas.style.width = "320px";
    canvas.style.height = "180px";
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, newWidth, newHeight);
    canvas.toBlob(
      (blob) => {
        // Handle untuk hasil kompres disimpan di lokal
        displayInfo('Original file', file);
        displayInfo('Compressed file', blob);
        
        // download link haisl kompres
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = 'compressed_image.jpg';
        downloadLink.innerText = 'Download Compressed Image';
        document.getElementById('content').append(downloadLink);
      },
      MIME_TYPE,
      QUALITY
    );
    document.getElementById("content").append(canvas);
  };
};

// Fungsi kalkulasi ukuran baru
function calculateSize(img, maxWidth, maxHeight) {
  let width = img.width;
  let height = img.height;

  // menghitung ukuran file
  if (width > height) {
    if (width > maxWidth) {
      height = Math.round((height * maxWidth) / width);
      width = maxWidth;
    }
  } else {
    if (height > maxHeight) {
      width = Math.round((width * maxHeight) / height);
      height = maxHeight;
    }
  }
  return [width, height];
}

//Fungsi tambahan untuk info ukuran hasil kompresi

function displayInfo(label, file) {
  const p = document.createElement('h3');
  p.innerText = `${label} - ${readableBytes(file.size)}`;
  document.getElementById('content').append(p);
}

function readableBytes(bytes) {
  const i = Math.floor(Math.log(bytes) / Math.log(1024)),
    sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
}

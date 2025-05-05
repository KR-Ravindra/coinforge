// curl -Ffile=@sample.txt 'https://kr-r.me/upload?token=12345'
async function uploadImage(file, fileName) {
    const formData = new FormData();
    formData.append("file",file, fileName);
  
    try {
      const response = await fetch(`https://kr-r.me/upload?token=12345`, {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error(`Failed to upload file: ${response.statusText}`);
      }
  
      const result = await response.json();
      console.log("File uploaded successfully:", result);
  
      // Assuming the server returns the URL of the uploaded file
      return result.url;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  }

export default uploadImage;
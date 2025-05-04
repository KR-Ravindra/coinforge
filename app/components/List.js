import { ethers } from "ethers";
import { useState } from "react";

function List({ toggleCreate, fee, provider, factory }) {
  const [imagePreview, setImagePreview] = useState(null); // State to store the image preview
  const [selectedImage, setSelectedImage] = useState(null); // State to store the selected file

  async function listHandler(form) {
    const name = form.get("name");
    const ticker = form.get("ticker");

    if (!selectedImage) {
      console.error("No image uploaded");
      return;
    }

    // Use FileReader to read the file locally
    const reader = new FileReader();
    reader.onload = () => {
      const imageData = reader.result; // Base64 string of the image
      console.log("Image data (Base64): ", imageData);

      // Save the Base64 string locally
      localStorage.setItem(`image-${name}`, imageData); // Save to localStorage
      console.log(`Image saved locally with key: image-${name}`);
    };
    reader.readAsDataURL(selectedImage); // Read the file as a Base64 string

    const signer = await provider.getSigner();

    const transaction = await factory.connect(signer).create(name, ticker, { value: fee });
    await transaction.wait();

    toggleCreate();
  }

  function handleImageChange(event) {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file); // Store the selected file in state
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result); // Set the image preview
      };
      reader.readAsDataURL(file);
    }
  }

  return (
    <div className="list">
      <h2>list new token</h2>

      <div className="list__description">
        <p>fee: {ethers.formatUnits(fee, 18)} ETH</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          listHandler(new FormData(e.target));
        }}
      >
        <input type="text" name="name" placeholder="name" />
        <input type="text" name="ticker" placeholder="ticker" />
        <input type="file" name="image" accept="image/*" onChange={handleImageChange} />

        {imagePreview && (
          <div>
            <p>Image Preview:</p>
            <img src={imagePreview} alt="Preview" style={{ maxWidth: "200px", marginTop: "10px" }} />
          </div>
        )}

        <input type="submit" value="[ list ]" />
      </form>

      <button onClick={toggleCreate} className="btn--fancy">[ cancel ]</button>
    </div>
  );
}

export default List;
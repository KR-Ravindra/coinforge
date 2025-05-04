
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import uploadImage from "../uploadImage";


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

    const fileName = `image-${name}.png`;
    try {
      const imageUrl = await uploadImage(selectedImage, fileName);
      console.log('Image uploaded to:', imageUrl);
  
      const signer = await provider.getSigner();
      const transaction = await factory.connect(signer).create(name, ticker, { value: fee });
      await transaction.wait();
  
      toggleCreate();
    } catch (error) {
      console.error('Error uploading image:', error);
    }
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
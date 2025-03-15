import fitz  # PyMuPDF
import base64
from io import BytesIO
from PIL import Image

# Function to load and encode the image
def image_to_vision_base64(image_bytes: bytes) -> dict:
    """Encode image as base64."""
    return {"image": base64.b64encode(image_bytes).decode("utf-8")}


def pdf_to_combined_image(pdf_content: bytes) -> BytesIO:
    """Convert PDF content to a combined image and return as BytesIO."""
    pdf_document = fitz.open(stream=pdf_content, filetype="pdf")
    images = []
    for pg in range(pdf_document.page_count):
        page = pdf_document[pg]
        zoom_x = 1.33333333
        zoom_y = 1.33333333
        mat = fitz.Matrix(zoom_x, zoom_y)
        pix = page.get_pixmap(matrix=mat, alpha=False)
        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        images.append(img)

    combined_image = Image.new(
        "RGB", (images[0].width, sum(img.height for img in images))
    )
    y_offset = 0
    for img in images:
        combined_image.paste(img, (0, y_offset))
        y_offset += img.height

    img_byte_array = BytesIO()
    combined_image.save(img_byte_array, format="JPEG")
    img_byte_array.seek(0)
    return img_byte_array

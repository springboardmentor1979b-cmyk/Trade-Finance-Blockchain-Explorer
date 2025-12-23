from pathlib import Path
from fastapi import UploadFile


class DocumentValidator:
    def __init__(self, max_size: int = 10 * 1024 * 1024):
        """Initializes the DocumentValidator with a maximum file size.

        Args:
            max_size (int): Maximum allowed file size in bytes (default is 10MB).
        """
        self.max_size = max_size
        self.allowed_extensions = [".pdf", ".docx", ".xlsx", ".png", ".jpg"]

    def validate_file_extension(self, file: UploadFile) -> bool:
        """Validates the file extension of the uploaded file.

        Args:
            file (UploadFile): The uploaded file.

        Returns:
            bool: True if the file extension is valid, False otherwise.
        """
        file_extension = Path(file.filename).suffix.lower()  # type: ignore
        return file_extension in self.allowed_extensions

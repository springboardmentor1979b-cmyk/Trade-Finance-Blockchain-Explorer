import hashlib


def generate_document_hash(file_path: str, algorithm="sha256") -> str:
    """Generates a hash for the given document using the specified algorithm.

    Args:
        file_path (str): Path to the file.
        algorithm (str): Hashing algorithm to use (default is 'sha256').

    Returns:
        str: The computed hash of the file.
    """
    try:
        hash_func = hashlib.new(algorithm)
        with open(file_path, "rb") as f:

            while chunk := f.read(8192):
                hash_func.update(chunk)

        return hash_func.hexdigest()
    except FileNotFoundError:
        raise ValueError(f"File not found: {file_path}")
    except ValueError:
        raise ValueError(f"Unsupported hash algorithm: {algorithm}")
    
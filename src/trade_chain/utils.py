"""Trade chain utility functions module.

Provides utility functions for trade document operations including
cryptographic hash generation for document integrity verification
and duplicate detection.

Typical usage:
    from src.trade_chain.utils import generate_document_hash

    # Generate SHA-256 hash of a document
    file_hash = generate_document_hash("/path/to/document.pdf")

    # Generate hash using different algorithm
    md5_hash = generate_document_hash("/path/to/document.pdf", algorithm="md5")
"""

import hashlib


def generate_document_hash(file_path: str, algorithm: str = "sha256") -> str:
    """Generate a cryptographic hash for a document file.

    Reads the file in chunks to efficiently handle large files and computes
    a hash using the specified algorithm. Used for document integrity
    verification and duplicate detection.

    Args:
        file_path: Absolute or relative path to the file to hash.
        algorithm: Hashing algorithm to use. Supports any algorithm
            available in hashlib (e.g., 'sha256', 'sha512', 'md5').
            Defaults to 'sha256'.

    Returns:
        The hexadecimal string representation of the computed hash.

    Raises:
        ValueError: If the file is not found at the specified path.
        ValueError: If the specified hash algorithm is not supported.

    Example:
        >>> hash_value = generate_document_hash("uploads/invoice.pdf")
        >>> print(hash_value)
        'a1b2c3d4e5f6...'

    Note:
        Uses 8KB chunks for memory-efficient processing of large files.
        The walrus operator (:=) requires Python 3.8+.
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

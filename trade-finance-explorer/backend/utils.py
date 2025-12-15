import hashlib

def calculate_file_hash(file_content: bytes) -> str:
    """
    Generates a SHA-256 hash for the given file content.
    This acts as the 'Digital Fingerprint' for the blockchain explorer.
    """
    sha256_hash = hashlib.sha256()
    sha256_hash.update(file_content)
    return sha256_hash.hexdigest()

import base64
import hashlib
import os
import time

import uuid


def generate_code_verifier():
    # Use os.urandom to generate a cryptographically secure random string
    code_verifier = base64.urlsafe_b64encode(os.urandom(40)).rstrip(b'=').decode('utf-8')
    return code_verifier


def generate_code_challenge(code_verifier):
    code_verifier_bytes = code_verifier.encode('utf-8')
    code_challenge = base64.urlsafe_b64encode(hashlib.sha256(code_verifier_bytes).digest()).rstrip(b'=').decode('utf-8')
    return code_challenge


def generate_uuid_with_timestamp():
    # Get current epoch time
    timestamp = int(time.time())

    # Convert timestamp to bytes
    timestamp_bytes = timestamp.to_bytes((timestamp.bit_length() + 7) // 8, byteorder='big')

    # Combine with some unique info
    unique_info = uuid.uuid4().bytes

    # Hash the combination
    hash_input = timestamp_bytes + unique_info
    hash_digest = hashlib.sha256(hash_input).digest()

    # Create a UUID from the hash
    generated_uuid = uuid.UUID(bytes=hash_digest[:16])
    return str(generated_uuid)

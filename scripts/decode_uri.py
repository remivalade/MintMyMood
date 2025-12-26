import json
import base64
import sys

def decode_token_uri(file_path):
    with open(file_path, 'r') as f:
        raw_data = f.read().strip()
    
    # Remove potential hex prefix and quotes from cast output
    if raw_data.startswith('0x'):
        # It's hex encoded string (abi encoded string)
        # cast call returns hex encoded data for string return type usually? 
        # Actually cast call returns the raw return value. 
        # If it's a string, it's ABI encoded.
        # Let's try to use cast to decode it first or handle it here.
        # But wait, cast call output might be just the string if I didn't use --raw?
        # Let's assume it might be the string "data:application/json;base64,..." inside quotes
        pass

    # Clean up the string
    # cast output usually looks like: "data:application/json;base64,eyJuYW1l..."
    clean_data = raw_data.strip('"')
    
    if not clean_data.startswith('data:application/json;base64,'):
        # It might be hex encoded ABI output
        try:
            # If it's hex, we need to decode the ABI string
            # But doing that manually is annoying. 
            # Let's assume for a moment it's the direct string or I can use cast --decode-abi
            # Actually, let's just try to split if it has the prefix
            pass
        except:
            print("Error: Unknown format")
            return

    if 'data:application/json;base64,' in clean_data:
        b64_json = clean_data.split('data:application/json;base64,')[1]
        try:
            json_str = base64.b64decode(b64_json).decode('utf-8')
            metadata = json.loads(json_str)
            
            print("Metadata Name:", metadata.get('name'))
            print("Metadata Description:", metadata.get('description'))
            
            image_data = metadata.get('image')
            if image_data and 'data:image/svg+xml;base64,' in image_data:
                b64_svg = image_data.split('data:image/svg+xml;base64,')[1]
                svg_content = base64.b64decode(b64_svg).decode('utf-8')
                
                with open('extracted_10.svg', 'w') as svg_file:
                    svg_file.write(svg_content)
                print("SVG saved to extracted_10.svg")
            else:
                print("No SVG image data found")
                
        except Exception as e:
            print(f"Error decoding: {e}")
    else:
        # Try decoding as hex if it looks like hex
        if clean_data.startswith('0x'):
            # This is likely ABI encoded string. 
            # The first 64 chars are offset, next 64 are length, then data.
            # Quick hack decode:
            try:
                # Remove 0x
                hex_str = clean_data[2:]
                # Find the start of the string data (skip offset and length)
                # This is brittle, better to use cast to decode if possible.
                # But let's try to find the data: pattern in hex
                # 'data' is 64617461
                idx = hex_str.find('64617461')
                if idx != -1:
                    relevant_hex = hex_str[idx:]
                    # Trim trailing zeros (padding)
                    # It might be padded with 00s at the end
                    import binascii
                    decoded = binascii.unhexlify(relevant_hex.rstrip('0')).decode('utf-8')
                    # Recursively call with decoded string
                    with open('temp_decoded.txt', 'w') as tf:
                        tf.write(decoded)
                    decode_token_uri('temp_decoded.txt')
                    return
            except Exception as e:
                print(f"Hex decode error: {e}")

if __name__ == "__main__":
    decode_token_uri('token_uri.txt')

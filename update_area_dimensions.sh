#!/usr/bin/env bash

# Convert Windows paths to Unix style if needed
convert_path() {
    echo "$1" | sed 's/\\/\//g'
}

# Check if image path argument is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <path_to_images>"
    echo "Example: $0 img/game/old"
    exit 1
fi

IMAGE_PATH=$(convert_path "$1")

# Verify the path exists
if [ ! -d "$IMAGE_PATH" ]; then
    echo "Error: Directory $IMAGE_PATH does not exist"
    exit 1
fi

# Create a backup
cp areas.js areas.js.backup

# Check for ImageMagick
if ! command -v magick &> /dev/null; then
    echo "Error: ImageMagick is not installed. Please install it first:"
    echo "Windows (with Chocolatey): choco install imagemagick"
    echo "Or download from: https://imagemagick.org/script/download.php#windows"
    exit 1
fi

# Function to get image dimensions using magick instead of identify
get_dimensions() {
    local ident=$1
    if [ -f "$IMAGE_PATH/$ident.png" ]; then
        magick identify -format "%wx%h" "$IMAGE_PATH/$ident.png"
    else
        echo "Warning: Image not found for $ident" >&2
        echo "0x0"
    fi
}

# Create temporary file for processing
temp_file=$(mktemp)

# Process each area and update the file using awk
awk -v img_path="$IMAGE_PATH" '
    BEGIN {
        in_area = 0
        in_point = 0
        current_ident = ""
    }
    
    # Start of an area object
    /^  {/ { in_area = 1 }
    
    # Capture the ident when we find it
    /ident:/ && in_area {
        match($0, /"([^"]+)"/, arr)
        current_ident = arr[1]
    }
    
    # When we find point: {, prepare to modify
    /point: {/ && in_area { 
        in_point = 1 
        print
        next
    }
    
    # After y coordinate in point block, add width and height
    /y:/ && in_point {
        # Add comma to y line if it doesnt have one
        if ($0 !~ /,$/) {
            sub(/$/, ",")
        }
        print
        # Get image dimensions using magick
        cmd = "magick identify -format \"%wx%h\" " img_path "/" current_ident ".png 2>/dev/null"
        if ((cmd | getline dimensions) > 0) {
            split(dimensions, dim, "x")
            printf "      width: %d,\n", dim[1]
            printf "      height: %d\n", dim[2]
        } else {
            print "      width: 0,"
            print "      height: 0"
        }
        close(cmd)
        next
    }
    
    # End of point block
    /^    }/ && in_point { 
        in_point = 0
        print
        next
    }
    
    # End of area object
    /^  }/ { 
        in_area = 0
        in_point = 0
        print
        next
    }
    
    # Print all other lines unchanged
    { print }
' areas.js > "$temp_file"

mv "$temp_file" areas.js

# Fix any formatting issues
awk '
    BEGIN { in_array=0 }
    /^var marioAreas = \[/ { in_array=1; print; next }
    /^];$/ { in_array=0; print; next }
    in_array { 
        if ($0 ~ /}$/) {
            if (prev_line !~ /},$/) {
                sub(/}$/, "},")
            }
        }
        print
        prev_line=$0
    }
    !in_array { print }
' areas.js > "$temp_file"
mv "$temp_file" areas.js

echo "Updated areas.js with image dimensions. Original file backed up as areas.js.backup"

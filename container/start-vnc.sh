#!/bin/bash

rm /tmp/.X11-unix/X1 -f
rm /tmp/.X1-lock -f
unset DEBIAN_FRONTEND

vncserver :1 -localhost no -SecurityTypes None --I-KNOW-THIS-IS-INSECURE

firefox :1

echo "Starting tail -f /dev/null..."
tail -f /dev/null

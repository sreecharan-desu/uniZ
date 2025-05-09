#!/bin/bash

clear

# ASCII Art Function
display_ascii_art() {
    figlet -c "Hi  Sreecharan ! hacking gtihub please wait . . ."
}

progress_bar() {
    local progress=$1
    local total=$2
    local terminal_width=$(tput cols)  # Get terminal width
    local width=$((terminal_width - 10))  # Reserve space for percentage display
    local percent=$((progress * 100 / total))
    local completed=$((progress * width / total))
    local remaining=$((width - completed))
    printf "\r[%-${width}s] %d%%" "$(printf '#%.0s' $(seq 1 $completed))" "$percent"
}


# Navigate to the project directory
cd ~/Projects/uniZ/ || { echo "Directory not found!"; exit 1; }

echo -e "\e[31m
                                     _   _ _    ____                     _                             
                                    | | | (_)  / ___| _ __ ___  ___  ___| |__   __ _ _ __ __ _ _ __   
                                    | |_| | |  \___ \| '__/ _ \/ _ \/ __| '_ \ / _' | '__/ _' | '_ \  
                                    |  _  | |   ___) | | |  __/  __/ (__| | | | (_| | | | (_| | | | | 
                                    |_| |_|_|  |____/|_|  \___|\___|\___|_| |_|\__,_|_|  \__,_|_| |_| 

     _                _    _                     _   _ _           _             _                                     _ _ 
    | |__   __ _  ___| | _(_)_ __   __ _    __ _| |_(_) |__  _   _| |__    _ __ | | ___  __ _ ___  ___  __      ____ _(_) |_
    | '_ \ / _' |/ __| |/ / | '_ \ / _' |  / _' | __| | '_ \| | | | '_ \  | '_ \| |/ _ \/ _' / __|/ _ \ \ \ /\ / / _' | | __|
    | | | | (_| | (__|   <| | | | | (_| | | (_| | |_| | | | | |_| | |_) | | |_) | |  __/ (_| \__ \  __/  \ V  V / (_| | | |_   _  _  _
    |_| |_|\__,_|\___|_|\_\_|_| |_|\__, |  \__, |\__|_|_| |_|\__,_|_.__/  | .__/|_|\___|\__,_|___/\___|   \_/\_/ \__,_|_|\__| (_)(_)(_)
                                   |___/   |___/                          |_|                                                            
"




echo

# Update contributions
total_commits=10  # Total number of commits
for i in $(seq 1 $total_commits); do
    echo $i >> counter.txt               # Update the file
    git add counter.txt >/dev/null 2>&1  # Suppress output
    git commit -m "Update contribution count: $i" >/dev/null 2>&1
    git push >/dev/null 2>&1             # Suppress push output
    progress_bar "$i" "$total_commits"   # Display progress bar
    sleep 1                              # Optional: Add a delay
done

echo
echo -e "\e[33m                                       
                                    
                                    
                                    
                                    
                                    
                                        Github hacked successfully checkout your contribution chart!
                                             
                                             
        "


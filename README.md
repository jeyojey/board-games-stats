# Board Games Stats Tracker

A simple web application to track your board game statistics, including wins, points, and losses.

## Features

- Add game results with custom game names
- Support for 2-5 players
- Track victory points for each player
- Automatic winner detection
- Game history with dates
- Persistent storage in a JSON file
- Clean and modern UI

## Setup and Running

1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Start the server:
   ```bash
   python server.py
   ```

3. Open your web browser and navigate to:
   ```
   http://localhost:5000
   ```

## How to Use

1. To add a new game result:
   - Enter the game name
   - Select the number of players (2-5)
   - Enter the victory points for each player
   - Click "Save Game Result"
2. View your game history below the form
   - Each game entry shows:
     - Game name and number of players
     - Individual player scores
     - The winner (highlighted in green)
     - Date played

## Technical Details

- Built with vanilla JavaScript, HTML, and CSS
- Backend server in Python using Flask
- Data is stored in `games.json` file
- Responsive design that works on both desktop and mobile devices

## Data Structure

Each game entry is stored with the following information:
- Game name
- Number of players
- Array of player scores
- Date played 
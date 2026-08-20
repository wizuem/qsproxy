/**
 * Games page catalogue.
 *
 * Three sources, all legitimate:
 *  - `archiveCollections`: thousands of classic titles legally hosted and
 *    made playable in-browser by the Internet Archive (emulated with EM-DOSBox).
 *  - `openSourceGames`: freely licensed / open-source HTML5 games that allow
 *    embedding, playable directly in a frame.
 *  - `portals`: legit free-to-play destinations, opened in the proxy browser.
 */

export const gamesConfig = {
  heading: "Quantum Games",
  subheading:
    "Thousands of playable classics from the Internet Archive, a shelf of open-source web games, and the best free game portals.",
  archiveCollections: [
    { id: "softwarelibrary_msdos_games", label: "MS-DOS classics" },
    { id: "softwarelibrary_win3_games", label: "Windows 3.x" },
    { id: "softwarelibrary_apple", label: "Apple II" },
    { id: "softwarelibrary_c64_games", label: "Commodore 64" },
    { id: "softwarelibrary_zx_spectrum", label: "ZX Spectrum" },
    { id: "handheldhistory", label: "Handheld LCD" },
    { id: "internetarcade", label: "Internet Arcade" },
  ],
  openSourceGames: [
    { label: "2048", url: "https://play2048.co", tag: "Puzzle" },
    { label: "Hextris", url: "https://hextris.io", tag: "Puzzle" },
    { label: "Astray", url: "https://wwwtyro.github.io/Astray/", tag: "Maze" },
    { label: "HexGL", url: "https://hexgl.bkcore.com/play/", tag: "Racing" },
    { label: "Kiwi Clicker", url: "https://gd.games", tag: "Casual" },
    { label: "Sudoku", url: "https://sudoku.com", tag: "Puzzle" },
    { label: "Minesweeper", url: "https://minesweeper.online", tag: "Puzzle" },
    { label: "Tetris (Open)", url: "https://tetris.com/play-tetris", tag: "Arcade" },
    { label: "Freeciv Web", url: "https://play.freeciv.org", tag: "Strategy" },
    { label: "Xterm Chess (Lichess)", url: "https://lichess.org", tag: "Board" },
    { label: "OpenArena Ports", url: "https://openarena.ws", tag: "Shooter" },
    { label: "The Powder Toy", url: "https://powdertoy.co.uk", tag: "Sandbox" },
    { label: "Bloxorz", url: "https://www.coolmathgames.com/0-bloxorz", tag: "Puzzle" },
    { label: "Slither.io", url: "https://slither.io", tag: ".io" },
    { label: "Agar.io", url: "https://agar.io", tag: ".io" },
    { label: "Diep.io", url: "https://diep.io", tag: ".io" },
    { label: "Paper.io", url: "https://paper-io.com", tag: ".io" },
    { label: "Wordle (NYT)", url: "https://www.nytimes.com/games/wordle", tag: "Word" },
  ],
  portals: [
    { label: "itch.io free web games", url: "https://itch.io/games/free/platform-web" },
    { label: "Poki", url: "https://poki.com" },
    { label: "CrazyGames", url: "https://www.crazygames.com" },
    { label: "Newgrounds", url: "https://www.newgrounds.com/games" },
    { label: "Kongregate", url: "https://www.kongregate.com" },
    { label: "Lichess", url: "https://lichess.org" },
    { label: "Chess.com", url: "https://www.chess.com/play" },
    { label: "Skribbl.io", url: "https://skribbl.io" },
    { label: "Jackbox (browser)", url: "https://jackbox.tv" },
    { label: "GDevelop games", url: "https://gd.games" },
  ],
};

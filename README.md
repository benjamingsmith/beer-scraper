# 🍺 Beer Scraper API

A Node.js API that scrapes and provides real-time taproom lists from popular craft beer venues in Los Angeles.

![Chat Application](https://img.shields.io/badge/status-active-success.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)

## 🎯 Overview

This API scrapes beer menus from:
- **Father's Office** (Santa Monica location)
- **Monkish Brewing Co.** (Torrance location)

The scraper extracts structured data including beer types, names, and descriptions, making it easy to programmatically access current beer availability.

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/beer-scraper.git
cd beer-scraper
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The API will be available at `http://localhost:3000`

## 📋 API Endpoints

### Father's Office
`/api/fo`<br />
***Example Response:***
`/api/monkish`<br />
***Example Response:***
```json
{
  "here": {
    "title": "At Taproom",
    "list": [
      {
        "type": "Hoppy",
        "name": "Foggy Window",
        "description": "Double India Pale Ale w/ Citra, Nelson Sauvin, & Galaxy • 8.1% ABV • (4pk/16oz)"
      }
    ]
  },
  "away": {
    "title": "To Go",
    "list": [
      {
        "type": "Hoppy",
        "name": "DDH Island",
        "description": "Double Dry Hopped Pale Ale w/ Citra • 6.5% ABV"
      }
    ]
  }
}
```

## 🛠️ Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Axios** - HTTP client for web requests
- **Cheerio** - Server-side jQuery implementation for HTML parsing

## ⚠️ Important Notes

- This scraper depends on the current HTML structure of the target websites
- Scrapers may break if the websites update their layout
- Be respectful of the websites' servers - avoid excessive requests
- Consider implementing caching to reduce load on target servers

## 🔧 Development

To modify or add new brewery scrapers:

1. Create a new file in the `locations/` directory and include the import/export in `/locations/index.js`
2. Implement the scraping logic using Axios and Cheerio
3. Add the new route to `index.js`
4. Export your scraper function for use in the main application

## 📝 Future Enhancements

- [ ] Highland Park Brewery
- [ ] Santa Monica Brew Works
- [ ] Everywhere Beer
- [ ] Far Field Beer Company
- [ ] Bottle Logic Brewing


## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
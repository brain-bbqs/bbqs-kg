# The People of BBQS - Knowledge Graph UI

A Next.js application for exploring the expertise and knowledge of BBQS community members.

## About The People of BBQS

The People of BBQS is a project that aims to gather the expertise of those involved in the BBQS initiative, along with the knowledge they wish to learn and share. Essentially, it seeks to collect and disseminate this knowledge to foster collaboration, skill development, and community growth.

The initial work began during the BBQS Unconference, an in-person event held from 15–17 July 2025. During this event, we developed the BBQS Bot, which automatically triggers a form when a new member joins the channel to capture their expertise.

## Features

- 👥 Browse BBQS community members and their expertise
- 🔍 Advanced search and filtering capabilities
- 🏷️ Filter by categories, quadrants, and attributes
- 📱 Responsive design for all devices
- ⚡ Fast and modern UI built with Next.js and Tailwind CSS

## Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd bbqs-kg-ui
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Configure environment variables:
```bash
cp env.example .env.local
```

Edit `.env.local` and set your data path:
```env
DATA_PATH=../data/sheets/output_kg.jsonl
```

### Data Configuration

The application reads knowledge graph data from a JSONL file. You can configure the data source using the `DATA_PATH` environment variable:

- **Relative path** (from project root): `DATA_PATH=../data/sheets/output_kg.jsonl`
- **Absolute path**: `DATA_PATH=/absolute/path/to/your/data.jsonl`
- **Custom location**: `DATA_PATH=../other-project/data.jsonl`

### Data Format

The application expects a JSONL file with BBQS community member entries in the following format:

```json
[
  {
    "fields": {
      "Name": "Member Name",
      "Role": "What do you do?",
      "Expertise": "What knowledge would you like to share?",
      "Interest": "What would you like to learn?",
      "Note": "What additional information would you like to share?",
      "Time": "Timestamp"
    },
    "mappings": {
      "Expertise": [
        {
          "concept_label": "Concept Name",
          "ontology_id": "ID",
          "ontology": "Ontology Source",
          "confidence": 0.9,
          "explanation": "Explanation"
        }
      ]
    }
  }
]
```

## Development

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

The application uses a client-side architecture where:
- Data is loaded via API routes (`/api/data`) to handle server-side file operations
- The main page is a client component that fetches data on mount
- Filtering and search are handled entirely on the client side for better performance

## Building for Production

```bash
npm run build
npm start
# or
yarn build
yarn start
```

## Deployment

### GitHub Pages (Automated)

The application is automatically deployed to GitHub Pages when you push to the `master` branch.

**Setup:**
1. Enable GitHub Pages in your repository settings
2. Set the source to "GitHub Actions"
3. Push to the `master` branch to trigger deployment

**Manual Build:**
```bash
npm run build
```

The built files will be in the `out` directory.

## Customization

### Styling

The application uses Tailwind CSS for styling. You can customize the design by modifying:

- `tailwind.config.js` - Tailwind configuration
- `app/globals.css` - Global styles
- Component-specific classes in the component files

### Data Transformation

Modify `app/api/data/route.ts` to customize how the knowledge graph data is transformed into community member profiles.

### Components

The main components are located in the `components/` directory:

- `SearchFilters.tsx` - Search and filtering interface
- `CommunityManager.tsx` - Display of community members

## License

MIT

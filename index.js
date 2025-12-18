#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';

const SECTORS_ENV = process.env.SECTORS || 'social-care';

// Sector configurations
const SECTOR_CONFIGS = {
  'social-care': {
    id: 'social-care',
    name: 'Health, Support & Social Care',
    description: 'Care homes, domiciliary care, supported living providers',
    regulators: ['CQC', 'DHSC', 'NHS England', 'NICE', 'Skills for Care'],
    searchTerms: ['adult social care', 'care quality', 'domiciliary care', 'care homes', 'CQC guidance'],
    departments: ['department-of-health-and-social-care', 'care-quality-commission', 'nhs-england'],
    priority: 'high'
  },
  'education': {
    id: 'education',
    name: 'Education',
    description: 'Schools, colleges, universities, training providers',
    regulators: ['Ofsted', 'DfE', 'OfS', 'ESFA'],
    searchTerms: ['schools', 'colleges', 'education standards', 'ofsted inspection', 'curriculum', 'SEND'],
    departments: ['department-for-education', 'ofsted', 'office-for-students'],
    priority: 'high'
  },
  'legal': {
    id: 'legal',
    name: 'Legal Services',
    description: 'Law firms, solicitors, legal service providers',
    regulators: ['SRA', 'Law Society', 'Legal Services Board'],
    searchTerms: ['solicitors', 'legal practice', 'SRA standards', 'law firm regulation', 'AML legal'],
    departments: ['solicitors-regulation-authority', 'legal-services-board', 'ministry-of-justice'],
    priority: 'high'
  },
  'charities': {
    id: 'charities',
    name: 'Charities & Not-for-Profit',
    description: 'Charities, community organizations, foundations',
    regulators: ['Charity Commission', 'OSCR', 'Charity Commission NI'],
    searchTerms: ['charities', 'charity governance', 'fundraising regulation', 'trustees', 'charity commission'],
    departments: ['charity-commission', 'department-for-culture-media-and-sport'],
    priority: 'medium'
  },
  'local-authority': {
    id: 'local-authority',
    name: 'Local Government',
    description: 'Local councils, public services',
    regulators: ['DLUHC', 'Local Government Ombudsman'],
    searchTerms: ['local government', 'local authorities', 'council services', 'public services'],
    departments: ['ministry-of-housing-communities-and-local-government', 'cabinet-office'],
    priority: 'medium'
  },
  'recruitment': {
    id: 'recruitment',
    name: 'Recruitment Agencies',
    description: 'Staffing agencies, recruitment firms',
    regulators: ['Employment Agency Standards Inspectorate', 'ICO', 'HMRC'],
    searchTerms: ['recruitment agencies', 'employment agencies', 'staffing regulation', 'agency workers'],
    departments: ['department-for-business-and-trade', 'hm-revenue-customs'],
    priority: 'medium'
  },
  'construction': {
    id: 'construction',
    name: 'Construction',
    description: 'Construction companies, property developers',
    regulators: ['HSE', 'Building Safety Regulator'],
    searchTerms: ['construction safety', 'building safety', 'building regulations', 'HSE construction'],
    departments: ['health-and-safety-executive', 'ministry-of-housing-communities-and-local-government'],
    priority: 'medium'
  }
};

// Helper functions
function getConfiguredSectors() {
  const sectorIds = SECTORS_ENV.split(',').map(s => s.trim()).filter(Boolean);
  return sectorIds.map(id => SECTOR_CONFIGS[id]).filter(Boolean);
}

async function searchGovUk(query, days, departments) {
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);
  const fromDateStr = fromDate.toISOString().split('T')[0];

  const params = new URLSearchParams({
    q: query,
    count: '50',
    order: '-public_timestamp',
    filter_public_timestamp_from: fromDateStr
  });

  if (departments && departments.length > 0) {
    departments.forEach(dept => params.append('filter_organisations[]', dept));
  }

  const url = `https://www.gov.uk/api/search.json?${params.toString()}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Gov.uk API error: ${response.status}`);
  }

  const data = await response.json();

  return {
    totalResults: data.total || 0,
    resultsShown: (data.results || []).length,
    searchPeriod: `Last ${days} days`,
    query,
    results: (data.results || []).map(r => ({
      title: r.title || 'Untitled',
      description: r.description || '',
      link: r.link ? `https://www.gov.uk${r.link}` : '',
      published: r.public_timestamp || '',
      organisations: r.organisations?.map(o => o.title).join(', ') || 'Unknown',
      documentType: r.content_store_document_type || 'Unknown'
    }))
  };
}

// MCP Server setup
const server = new Server(
  {
    name: 'uk-regulatory-intelligence',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'search_publications',
        description: 'Search for regulatory publications, guidance, and policy documents from UK government departments and regulators. Filtered by your configured sectors.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search terms (e.g., "safeguarding", "inspection framework")',
            },
            days: {
              type: 'number',
              description: 'How far back to search in days (default: 30)',
            },
            sector: {
              type: 'string',
              description: 'Optional: Specific sector to search (must be configured)',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_parliamentary_questions',
        description: 'Find parliamentary questions and ministerial answers relevant to your sectors.',
        inputSchema: {
          type: 'object',
          properties: {
            days: {
              type: 'number',
              description: 'How far back to search in days (default: 90)',
            },
            searchTerm: {
              type: 'string',
              description: 'Term to search for (default: "care")',
            },
            sector: {
              type: 'string',
              description: 'Optional: Specific sector to filter',
            },
          },
        },
      },
      {
        name: 'get_regulatory_calendar',
        description: 'View upcoming regulatory changes, consultations, and deadlines.',
        inputSchema: {
          type: 'object',
          properties: {
            months: {
              type: 'number',
              description: 'How many months ahead to look (default: 6)',
            },
            sector: {
              type: 'string',
              description: 'Optional: Specific sector to check',
            },
          },
        },
      },
      {
        name: 'generate_monthly_digest',
        description: 'Generate a comprehensive monthly summary across all configured sectors.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'list_configured_sectors',
        description: 'Show which sectors are currently configured.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;

    switch (name) {
      case 'search_publications': {
        const { query, days = 30, sector } = args;
        const configuredSectors = getConfiguredSectors();
        
        let sectorsToSearch = configuredSectors;
        if (sector) {
          const sectorConfig = SECTOR_CONFIGS[sector];
          if (!sectorConfig || !configuredSectors.find(s => s.id === sector)) {
            throw new Error(`Sector '${sector}' not configured. Available: ${configuredSectors.map(s => s.id).join(', ')}`);
          }
          sectorsToSearch = [sectorConfig];
        }

        const departments = sectorsToSearch.flatMap(s => s.departments);
        const enhancedQuery = sectorsToSearch.length === 1 
          ? `${query} (${sectorsToSearch[0].searchTerms.slice(0, 2).join(' OR ')})`
          : query;

        const searchResults = await searchGovUk(enhancedQuery, days, departments);
        result = {
          ...searchResults,
          sectorsSearched: sectorsToSearch.map(s => s.name),
          note: sectorsToSearch.length === 1 
            ? `Results filtered for ${sectorsToSearch[0].name} sector`
            : `Results across ${sectorsToSearch.length} configured sectors`
        };
        break;
      }

      case 'get_parliamentary_questions': {
        const { days = 90, searchTerm = 'care', sector } = args;
        const configuredSectors = getConfiguredSectors();
        
        let sectorToUse = configuredSectors[0];
        if (sector) {
          const sectorConfig = SECTOR_CONFIGS[sector];
          if (!sectorConfig || !configuredSectors.find(s => s.id === sector)) {
            throw new Error(`Sector '${sector}' not configured`);
          }
          sectorToUse = sectorConfig;
        }

        const enhancedTerm = `${searchTerm} ${sectorToUse.searchTerms[0]}`;
        const searchResults = await searchGovUk(`${enhancedTerm} parliamentary`, days, sectorToUse.departments);
        
        result = {
          totalFound: searchResults.totalResults,
          resultsShown: searchResults.resultsShown,
          searchPeriod: `Last ${days} days`,
          searchTerm,
          sector: sectorToUse.name,
          results: searchResults.results.slice(0, 20),
          note: `Parliamentary questions filtered for ${sectorToUse.name} sector`
        };
        break;
      }

      case 'get_regulatory_calendar': {
        const { months = 6, sector } = args;
        const configuredSectors = getConfiguredSectors();
        
        let sectorsToSearch = configuredSectors;
        if (sector) {
          const sectorConfig = SECTOR_CONFIGS[sector];
          if (!sectorConfig || !configuredSectors.find(s => s.id === sector)) {
            throw new Error(`Sector '${sector}' not configured`);
          }
          sectorsToSearch = [sectorConfig];
        }

        const departments = sectorsToSearch.flatMap(s => s.departments);
        const searchResults = await searchGovUk('consultation OR "upcoming changes" OR deadline', 90, departments);
        
        result = {
          note: 'Recent publications about upcoming changes and consultations. Review each for specific deadlines.',
          searchPeriod: 'Last 90 days',
          lookingAhead: `${months} months`,
          sectorsSearched: sectorsToSearch.map(s => s.name),
          upcomingItems: searchResults.results
        };
        break;
      }

      case 'generate_monthly_digest': {
        const configuredSectors = getConfiguredSectors();
        const allDepartments = configuredSectors.flatMap(s => s.departments);
        
        const publicationsQuery = configuredSectors.flatMap(s => s.searchTerms.slice(0, 2)).join(' OR ');
        const publications = await searchGovUk(publicationsQuery, 30, allDepartments);
        const parliamentary = await searchGovUk('parliamentary care health education legal', 30, allDepartments);
        const upcoming = await searchGovUk('consultation OR "upcoming changes"', 90, allDepartments);

        result = {
          generatedDate: new Date().toISOString().split('T')[0],
          period: 'Last 30 days',
          sectorsIncluded: configuredSectors.map(s => ({
            id: s.id,
            name: s.name,
            regulators: s.regulators
          })),
          sections: {
            publications: {
              total: publications.totalResults,
              items: publications.results.slice(0, 10)
            },
            parliamentary: {
              total: parliamentary.totalResults,
              items: parliamentary.results.slice(0, 10)
            },
            upcomingChanges: {
              total: upcoming.totalResults,
              items: upcoming.results.slice(0, 5)
            }
          }
        };
        break;
      }

      case 'list_configured_sectors': {
        const configuredSectors = getConfiguredSectors();
        const allSectorIds = Object.keys(SECTOR_CONFIGS);

        result = {
          configuredSectors: configuredSectors.map(s => ({
            id: s.id,
            name: s.name,
            description: s.description,
            regulators: s.regulators,
            priority: s.priority
          })),
          availableSectors: allSectorIds.map(id => ({
            id,
            name: SECTOR_CONFIGS[id].name,
            description: SECTOR_CONFIGS[id].description,
            regulators: SECTOR_CONFIGS[id].regulators,
            priority: SECTOR_CONFIGS[id].priority
          })),
          configuration: {
            environment: SECTORS_ENV,
            howToChange: 'Set SECTORS environment variable in Claude Desktop config (e.g., SECTORS=social-care,education)'
          }
        };
        break;
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: error.message }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('UK Regulatory Intelligence MCP Server running');
  console.error(`Configured sectors: ${SECTORS_ENV}`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

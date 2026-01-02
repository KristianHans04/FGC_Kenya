# Documentation

This directory contains comprehensive documentation for the FIRST Global Team Kenya application, organized following industry-standard practices.

## Structure

```
docs/
├── guides/                    # General guides and tutorials
│   ├── getting-started.md    # Setup and installation
│   ├── development.md        # Development workflow
│   ├── deployment.md         # Deployment guides
│   ├── design-system.md      # UI components and styling
│   ├── architecture.md       # System architecture

│   ├── tailwind-v4-theming.md    # Theming guide
│   └── features/             # Feature documentation
│       ├── authentication.md
│       ├── dashboard.md
│       ├── email-system.md
│       └── ...
├── api/                      # API documentation
│   └── overview.md          # API overview and usage
├── contributing/            # Contribution guidelines
│   └── contributing.md      # How to contribute
├── security/                # Security documentation
│   └── overview.md          # Security features
└── internal/                # Internal technical docs (gitignored)
    ├── guides/              # Detailed technical guides
    │   └── development-standards.md # Complete coding standards
    ├── api/                 # Complete API documentation
    │   └── detailed.md      # Full API specifications
    ├── contributing/        # Internal contribution guidelines
    ├── security/            # Security analysis and considerations
    │   └── considerations.md # Security analysis
    └── README.md            # Internal docs overview
```

## Documentation Philosophy

### Two Documentation Sets

This repository maintains **two separate documentation systems** for different audiences:

#### Public Documentation (`docs/`)
- **Audience**: Open source community, users, contributors
- **Content**: User-friendly guides, feature overviews, setup instructions
- **Style**: Natural language, approachable, practical
- **Security**: No sensitive technical implementation details

#### Internal Documentation (`docs/internal/`)
- **Audience**: Core development team only
- **Content**: Complete technical specifications, API details, security analysis
- **Style**: Detailed, technical, implementation-focused
- **Security**: Contains sensitive information, completely gitignored

### Why Two Systems?

- **Security**: Protect sensitive implementation details from public exposure
- **Usability**: Public docs focus on helping users, internal docs on development
- **Professionalism**: Maintain clean separation between user-facing and technical content
- **Education**: Public docs provide learning value without compromising security

## Quick Start

1. **New to the project?** Start with [Getting Started](guides/getting-started.md)
2. **Want to contribute?** Read [Contributing](contributing/contributing.md)
3. **Building features?** Check [Development](guides/development.md)
4. **API integration?** See [API Overview](api/overview.md)

## Security & Privacy

- Sensitive technical documentation is kept in `docs/internal/` (gitignored)
- Public documentation focuses on user experience and high-level features
- No sensitive data (API keys, credentials) is exposed in documentation
- Security best practices are demonstrated without revealing vulnerabilities

## Contributing to Documentation

### Public Documentation
- Keep it user-friendly and approachable
- Focus on "how to" and practical usage
- Avoid technical implementation details
- Use clear, simple language

### Internal Documentation
- Include complete technical specifications
- Document API endpoints, schemas, and configurations
- Maintain detailed implementation guides
- Keep security-sensitive information here

## Documentation Standards

### File Naming
- Use kebab-case: `getting-started.md`, `api-overview.md`
- Be descriptive but concise
- Group related docs in subfolders

### Content Guidelines
- Start with overview/summary
- Include practical examples where helpful
- Use clear headings and sections
- Keep language professional but accessible
- Include links to related documentation

### Maintenance
- Update docs when features change
- Review documentation in code reviews
- Keep internal and public docs in sync (conceptually)
- Archive outdated documentation

## Industry Standards Followed

This documentation structure follows industry best practices:

- **Divio's Documentation System**: Tutorials, How-to guides, Reference, Explanation
- **Standard folder structure**: `guides/`, `api/`, `contributing/`, `security/`
- **Clear separation**: Public vs internal documentation
- **Git-based workflow**: Documentation as code with proper versioning

## Support

- **For users**: Use public documentation and GitHub issues
- **For contributors**: Check contributing guidelines and internal docs
- **For maintainers**: Refer to internal documentation for technical details

---

*This documentation is maintained by the FIRST Global Team Kenya development team.*
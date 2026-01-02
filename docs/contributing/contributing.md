# Contributing Guide

We welcome contributions to the FIRST Global Team Kenya website! This guide outlines the process for contributing code, reporting issues, and improving the project.

## Code of Conduct

This project follows a code of conduct to ensure a welcoming environment for all contributors. By participating, you agree to:

- Be respectful and inclusive
- Focus on constructive feedback
- Accept responsibility for mistakes
- Show empathy towards other contributors
- Help create a positive community

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Git
- Code editor (VS Code recommended)

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/fgc-kenya.git`
3. Install dependencies: `npm install`
4. Set up environment: `cp .env.example .env.local`
5. Configure database and email settings
6. Run setup: `npm run setup`
7. Start development: `npm run dev`

## Development Workflow

### 1. Choose an Issue
- Check the [GitHub Issues](https://github.com/fgc-kenya/website/issues) for open tasks
- Look for issues labeled "good first issue" or "help wanted"
- Comment on the issue to indicate you're working on it

### 2. Create a Branch
```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
# or
git checkout -b docs/update-readme
```

### 3. Make Changes
- Follow established coding standards and best practices
- Write clear, concise commit messages
- Test your changes thoroughly
- Update documentation if needed

### 4. Test Your Changes
```bash
# Run tests
npm test

# Run linting
npm run lint

# Check type checking
npm run typecheck

# Manual testing in browser
npm run dev
```

### 5. Commit Your Changes
```bash
# Stage your changes
git add .

# Commit with a clear message
git commit -m "feat: add user authentication feature

- Implement OTP-based login system
- Add JWT token management
- Create authentication middleware
- Update API endpoints for auth"

# Push to your branch
git push origin feature/your-feature-name
```

### 6. Create a Pull Request
- Go to the original repository
- Click "New Pull Request"
- Select your branch as the source
- Fill out the pull request template
- Request review from maintainers

## Pull Request Guidelines

### PR Template
Please fill out the pull request template completely:

```markdown
## Description
Brief description of the changes made.

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change
- [ ] Documentation update
- [ ] Refactoring
- [ ] Performance improvement

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] All tests pass

## Screenshots (if applicable)
Add screenshots of UI changes.

## Checklist
- [ ] Code follows project standards
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] No linting errors
- [ ] Security review completed
- [ ] Performance impact assessed
```

### PR Review Process
1. **Automated Checks**: CI/CD pipeline runs tests and linting
2. **Code Review**: Maintainers review code for quality and standards
3. **Testing**: Additional testing may be requested
4. **Approval**: PR approved and merged, or feedback provided for changes

## Coding Standards

### General Guidelines
- Follow established coding standards and best practices
- Use TypeScript for type safety
- Write self-documenting code
- Keep functions small and focused
- Use meaningful variable and function names

### Code Style
- Use ESLint and Prettier configurations
- Follow conventional commit format
- Use semantic HTML
- Maintain consistent indentation
- Add comments for complex logic

### Testing Requirements
- Write unit tests for new functions
- Add integration tests for API endpoints
- Test components with React Testing Library
- Aim for 80%+ test coverage
- Test edge cases and error conditions

## Documentation

### When to Update Documentation
- Adding new features
- Changing existing functionality
- Fixing bugs that affect user experience
- Updating dependencies
- Security-related changes

### Documentation Standards
- Use clear, concise language
- Include code examples
- Update relevant README files
- Keep API documentation current
- Test documentation for accuracy

## Security Considerations

### Security Checklist
- [ ] No secrets committed to code
- [ ] Input validation implemented
- [ ] XSS prevention measures in place
- [ ] CSRF protection for forms
- [ ] Secure headers configured
- [ ] Dependencies scanned for vulnerabilities
- [ ] Authentication/authorization properly implemented
- [ ] Error messages don't leak sensitive information

### Reporting Security Issues
- **DO NOT** create public GitHub issues for security vulnerabilities
- Email security concerns to: security@fgckenya.com
- Provide detailed information about the vulnerability
- Allow time for the team to investigate and fix before public disclosure

## Types of Contributions

### Code Contributions
- Bug fixes
- New features
- Performance improvements
- Code refactoring
- Security enhancements

### Documentation
- README updates
- API documentation
- Code comments
- User guides
- Technical documentation

### Testing
- Unit tests
- Integration tests
- End-to-end tests
- Performance tests
- Security tests

### Design
- UI/UX improvements
- Accessibility enhancements
- Responsive design fixes
- Design system updates

### Translation
- Multi-language support
- Content localization
- Translation file updates

## Issue Reporting

### Bug Reports
When reporting bugs, please include:

1. **Clear Title**: Describe the issue concisely
2. **Steps to Reproduce**: Detailed steps to reproduce the bug
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: Browser, OS, Node version
6. **Screenshots**: Visual evidence of the issue
7. **Console Errors**: Any JavaScript errors

### Feature Requests
For new features, please include:

1. **Clear Description**: What feature you want
2. **Use Case**: Why this feature is needed
3. **Implementation Ideas**: How it could be implemented
4. **Mockups**: Visual examples if applicable
5. **Priority**: How important this feature is

### Question Template
For questions and support:

1. **What are you trying to do?**
2. **What have you tried?**
3. **What's not working?**
4. **Environment details**

## Community Guidelines

### Communication
- Be respectful and professional
- Use inclusive language
- Stay on topic
- Provide constructive feedback
- Help other contributors

### Recognition
Contributors are recognized through:
- GitHub contributor statistics
- Mention in release notes
- Attribution in documentation
- Community acknowledgments

### Getting Help
- Check existing documentation first
- Search GitHub issues and discussions
- Ask questions in GitHub discussions
- Contact maintainers for urgent issues

## License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project (MIT License).

## Recognition

We appreciate all contributions, big and small. Contributors will be acknowledged in:
- Project README
- Release notes
- Contributor acknowledgments
- Community events

Thank you for contributing to FIRST Global Team Kenya!
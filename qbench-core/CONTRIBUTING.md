# Contributing to QBench Core Library

Thank you for your interest in contributing to the QBench Core Library! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Process](#contributing-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

This project adheres to a code of conduct that we expect all contributors to follow. Please be respectful and professional in all interactions.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Create a new branch for your feature or bugfix
4. Make your changes
5. Test your changes thoroughly
6. Submit a pull request

## Development Setup

### Prerequisites

- Node.js 16+ and npm
- Git
- A modern web browser for testing

### Installation

```bash
# Clone your fork
git clone https://github.com/yourusername/qbench-core.git
cd qbench-core

# Install dependencies
npm install

# Build the project
npm run build

# Start development server
npm run serve
```

### Project Structure

```
qbench-core/
├── src/                    # Source code
│   ├── qbench-worksheet.js # Main entry point
│   ├── core/               # Core modules
│   ├── components/         # UI components
│   └── styles/             # CSS files
├── examples/               # Example configurations
├── dist/                   # Built files (auto-generated)
├── docs/                   # Documentation
└── tests/                  # Test files
```

## Contributing Process

### 1. Issue First

Before starting work on a feature or bug fix:

- Check existing issues to avoid duplication
- Create a new issue describing the problem or feature request
- Wait for discussion and approval before starting work

### 2. Branch Naming

Use descriptive branch names:

- `feature/add-new-calculation-mode`
- `bugfix/fix-unit-conversion-error`
- `docs/update-api-documentation`

### 3. Commit Messages

Follow conventional commit format:

```
type(scope): description

body (optional)

footer (optional)
```

Examples:
- `feat(calculations): add support for custom precision`
- `fix(ui): resolve modal close button issue`
- `docs(readme): update installation instructions`

### 4. Pull Request Guidelines

- Fill out the pull request template completely
- Include tests for new functionality
- Update documentation as needed
- Ensure all CI checks pass
- Request review from maintainers

## Coding Standards

### JavaScript

- Use ES6+ modern JavaScript features
- Follow ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Prefer const/let over var
- Use arrow functions where appropriate

Example:
```javascript
/**
 * Calculate the mean of an array of values
 * @param {number[]} values - Array of numeric values
 * @returns {number|null} Mean value or null if empty array
 */
const calculateMean = (values) => {
    if (!values.length) return null;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
};
```

### CSS

- Use BEM methodology for class naming
- Prefer CSS custom properties for theming
- Mobile-first responsive design
- Use semantic units (rem, em) over pixels

Example:
```css
.qbench-modal {
    /* Block */
}

.qbench-modal__header {
    /* Element */
}

.qbench-modal--large {
    /* Modifier */
}
```

### HTML

- Use semantic HTML5 elements
- Include proper accessibility attributes
- Validate markup
- Use meaningful class names

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

- Write unit tests for all new functions
- Include integration tests for complex features
- Test error conditions and edge cases
- Mock external dependencies

Example:
```javascript
describe('calculateMean', () => {
    it('should calculate mean of positive numbers', () => {
        const result = calculateMean([1, 2, 3, 4, 5]);
        expect(result).toBe(3);
    });

    it('should return null for empty array', () => {
        const result = calculateMean([]);
        expect(result).toBeNull();
    });
});
```

### Browser Testing

Test your changes in:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Documentation

### API Documentation

- Use JSDoc for all public APIs
- Include examples in documentation
- Document parameter types and return values
- Explain complex algorithms

### README Updates

- Keep installation instructions current
- Update feature lists
- Add new examples
- Fix broken links

### Examples

When adding new features:
- Create example configurations
- Update existing examples if needed
- Test examples thoroughly
- Document edge cases

## Module Development Guidelines

### Creating New Modules

1. Place modules in appropriate directories:
   - Core functionality: `src/core/`
   - UI components: `src/components/`
   - Utilities: `src/utils/`

2. Follow module template:
```javascript
/**
 * Module description
 */
export class ModuleName {
    constructor(config, worksheet) {
        this.config = config;
        this.worksheet = worksheet;
    }

    /**
     * Initialize the module
     */
    initialize() {
        // Setup code
    }

    /**
     * Cleanup when module is destroyed
     */
    destroy() {
        // Cleanup code
    }
}
```

3. Register module in main worksheet class
4. Add configuration options
5. Write tests
6. Update documentation

### Configuration Schema

When adding new configuration options:

1. Add to default configuration
2. Document in README
3. Add validation if needed
4. Update TypeScript definitions (if applicable)

## Performance Guidelines

- Avoid DOM queries in loops
- Use event delegation for dynamic content
- Implement debouncing for frequent operations
- Cache expensive calculations
- Minimize bundle size

## Security Considerations

- Validate all user inputs
- Sanitize data before DOM insertion
- Use CSP-compatible code
- Avoid eval() and similar functions
- Handle errors gracefully

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Create release branch
4. Test thoroughly
5. Create GitHub release with notes
6. Publish to npm (maintainers only)
7. Update CDN (maintainers only)

## Getting Help

- Check existing documentation
- Search issues for similar problems
- Join discussions in issues/PRs
- Contact maintainers for complex questions

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Documentation credits

Thank you for contributing to QBench Core Library!

# Contributing to MintMyMood

Thank you for your interest in contributing to MintMyMood! This document provides guidelines for contributing to the project.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Workflow](#development-workflow)
3. [Code Standards](#code-standards)
4. [Git Workflow](#git-workflow)
5. [Pull Request Process](#pull-request-process)
6. [Testing Requirements](#testing-requirements)
7. [Documentation](#documentation)

---

## Getting Started

### Prerequisites

Before contributing, ensure you have:

1. **Read the documentation**:
   - [README.md](../README.md) - Project overview
   - [QUICK_START.md](QUICK_START.md) - Setup guide
   - [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) - Architecture

2. **Set up your development environment**:
   ```bash
   npm install
   cd contracts && forge build
   npm run dev  # Verify everything works
   ```

3. **Joined the community** (if applicable):
   - Discord/Telegram (link TBD)
   - GitHub Discussions

---

## Development Workflow

### 1. Find an Issue

- Check [GitHub Issues](https://github.com/your-repo/issues)
- Look for issues labeled `good first issue` or `help wanted`
- Comment on the issue to let others know you're working on it

### 2. Create a Feature Branch

```bash
# Update main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### 3. Make Changes

- Write clear, focused code
- Follow existing code style
- Add comments for complex logic
- Update documentation if needed

### 4. Test Your Changes

```bash
# Frontend
npm run dev
# Test manually in browser

# Smart contracts
cd contracts
forge test
forge test -vvv  # Verbose output for debugging

# Build to ensure no TypeScript errors
npm run build
```

### 5. Commit Your Work

```bash
git add .
git commit -m "feat: add new feature description"
```

See [Commit Message Guidelines](#commit-message-guidelines) below.

### 6. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

---

## Code Standards

### TypeScript/React

- **Use TypeScript** for all new files
- **Follow existing patterns** in the codebase
- **Use functional components** with hooks
- **Extract reusable logic** into custom hooks

**Example**:
```typescript
// Good ✅
interface MyComponentProps {
  title: string;
  onSubmit: (value: string) => void;
}

export default function MyComponent({ title, onSubmit }: MyComponentProps) {
  const [value, setValue] = useState('');

  return (
    <div className="p-4">
      <h1>{title}</h1>
      <button onClick={() => onSubmit(value)}>Submit</button>
    </div>
  );
}
```

### Solidity

- **Follow OpenZeppelin standards**
- **Add NatSpec comments** for all public functions
- **Write comprehensive tests** for all new functions
- **Gas optimization** is important but prioritize readability

**Example**:
```solidity
/**
 * @notice Mints a new journal entry as an NFT
 * @param _text Journal entry text (max 400 bytes)
 * @param _mood Emoji mood (max 64 bytes)
 * @return tokenId The ID of the newly minted token
 */
function mintEntry(
    string memory _text,
    string memory _mood
) public returns (uint256) {
    // Implementation
}
```

### CSS/Tailwind

- **Use Tailwind utility classes** primarily
- **Keep custom CSS minimal** (only in globals.css if needed)
- **Follow the 8pt grid system** for spacing
- **Use design system colors** from CLAUDE.md

```typescript
// Good ✅
<div className="p-4 bg-paper-cream text-soft-black">

// Avoid ❌
<div style={{ padding: '17px', backgroundColor: '#ABC123' }}>
```

---

## Git Workflow

### Branch Naming

- **Feature**: `feature/short-description`
- **Bug fix**: `fix/bug-description`
- **Hotfix**: `hotfix/critical-issue`
- **Documentation**: `docs/what-changed`
- **Refactor**: `refactor/component-name`

### Commit Message Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
<type>(<scope>): <subject>

# Types:
feat:     New feature
fix:      Bug fix
docs:     Documentation changes
style:    Code style (formatting, missing semicolons, etc.)
refactor: Code refactoring
test:     Adding or updating tests
chore:    Build process or tooling changes

# Examples:
feat(minting): add ENS signature verification
fix(gallery): resolve NFT image loading issue
docs(readme): update deployment instructions
test(contracts): add tests for SVG generation
```

### Good Commit Examples

```bash
✅ feat(gallery): add chain filter dropdown
✅ fix(minting): handle expired signatures gracefully
✅ docs(contributing): add code style guidelines
✅ test(contracts): add edge case for long ENS names
✅ refactor(hooks): extract signature logic to custom hook
```

### Bad Commit Examples

```bash
❌ update stuff
❌ fix bug
❌ WIP
❌ asdfasdf
❌ final changes (really this time)
```

---

## Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] All tests pass (`forge test` and manual testing)
- [ ] No TypeScript errors (`npm run build`)
- [ ] Documentation updated (if applicable)
- [ ] Commit messages follow guidelines
- [ ] PR description is clear and complete

### PR Template

When creating a PR, include:

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How did you test this?
- [ ] Manual testing (describe steps)
- [ ] Added unit tests
- [ ] Tested on testnet

## Screenshots (if applicable)
Add before/after screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No console errors
```

### Review Process

1. **Automated checks** must pass (if configured)
2. **At least one reviewer** must approve
3. **Address review comments** promptly
4. **Squash commits** if requested
5. **Maintainer will merge** once approved

---

## Testing Requirements

### Frontend Changes

- [ ] Test in browser (Chrome, Firefox, Safari)
- [ ] Test wallet connection (MetaMask, Rabby)
- [ ] Test on mobile (iOS Safari, Android Chrome)
- [ ] No console errors
- [ ] No TypeScript errors (`npm run build`)

### Smart Contract Changes

- [ ] All existing tests pass (`forge test`)
- [ ] New tests added for new functionality
- [ ] Gas costs acceptable (`forge test --gas-report`)
- [ ] Test on Anvil (local) before testnet
- [ ] Deploy to testnet and verify

```bash
# Run all tests
forge test -vvv

# Test specific function
forge test --match-test testMintEntry -vvv

# Gas report
forge test --gas-report
```

### Backend API Changes

- [ ] Test endpoint manually
- [ ] Rate limiting works
- [ ] CORS configured correctly
- [ ] Error handling tested

---

## Documentation

### When to Update Docs

Update documentation when you:

- Add a new feature
- Change existing behavior
- Add new environment variables
- Modify deployment process
- Fix a bug that affects setup

### Which Docs to Update

- **README.md**: Project overview, status, quick start
- **DEVELOPER_GUIDE.md**: Architecture, workflow, common tasks
- **CONTRACT_GUIDE.md**: Smart contract details
- **DEPLOYMENT.md**: Deployment process
- **QUICK_START.md**: Setup instructions

### Documentation Style

- **Be concise**: Short paragraphs, bullet points
- **Be clear**: Assume reader is unfamiliar with the code
- **Be accurate**: Test your documentation steps
- **Use examples**: Show, don't just tell

---

## Code of Conduct

### Our Standards

- **Be respectful**: Treat everyone with respect
- **Be constructive**: Focus on improving the code, not criticizing people
- **Be collaborative**: We're all here to build something great
- **Be patient**: Remember that everyone was a beginner once

### Unacceptable Behavior

- Harassment or discriminatory language
- Personal attacks
- Trolling or inflammatory comments
- Spam or off-topic discussions

---

## Questions?

- **GitHub Discussions**: Ask questions, share ideas
- **GitHub Issues**: Report bugs or request features
- **Discord/Telegram**: (Link TBD) Real-time chat

---

## Recognition

Contributors will be:

- Listed in CONTRIBUTORS.md (TBD)
- Mentioned in release notes
- Credited in the project

---

**Thank you for contributing to MintMyMood!** 🚀

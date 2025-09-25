# Contributing to Plant Disease Detector PWA

Thank you for your interest in contributing to the Plant Disease Detector PWA! This document provides guidelines and information for contributors.

## 🌱 Project Overview

This is a Progressive Web App that uses YOLOv8s and ONNX Runtime to detect plant diseases directly in the browser. The project emphasizes privacy, performance, and accessibility.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Git
- A code editor (VS Code recommended)

### Development Setup

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/yourusername/plant-disease-detector-yolov8s.git
   cd plant-disease-detector-yolov8s
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run setup check:**
   ```bash
   npm run setup
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:** Navigate to http://localhost:3000

## 📝 How to Contribute

### Reporting Issues

When reporting bugs or issues:

1. **Search existing issues** first to avoid duplicates
2. **Use the issue template** if available
3. **Provide clear reproduction steps**
4. **Include system information:**
   - Browser and version
   - Operating system
   - Model file size (if applicable)
   - Error messages from browser console

### Suggesting Features

For feature requests:

1. **Check if the feature already exists** or is planned
2. **Describe the problem** you're trying to solve
3. **Explain your proposed solution**
4. **Consider the impact** on performance and user experience
5. **Provide mockups or examples** if helpful

### Code Contributions

#### Types of Contributions Welcome

- 🐛 **Bug fixes**
- ✨ **New features**
- 🎨 **UI/UX improvements**
- 📱 **Mobile optimizations**
- ⚡ **Performance improvements**
- 🔧 **Model optimization**
- 📚 **Documentation improvements**
- 🧪 **Testing improvements**
- 🌐 **Internationalization**

#### Development Process

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

2. **Make your changes:**
   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation if needed
   - Test your changes thoroughly

3. **Run quality checks:**
   ```bash
   npm run type-check
   npm run setup
   ```

4. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   # or
   git commit -m "fix: resolve issue description"
   ```

5. **Push and create a pull request:**
   ```bash
   git push origin feature/your-feature-name
   ```

## 🎯 Code Style Guidelines

### TypeScript/React

- Use **TypeScript** for all new components
- Follow **React functional components** with hooks
- Use **proper typing** - avoid `any` type
- Follow **React best practices** (keys, effects, etc.)
- Use **meaningful variable names**

### CSS/Styling

- Use **Tailwind CSS** classes when possible
- Follow **mobile-first** responsive design
- Support **dark mode** in new components
- Ensure **accessibility** (ARIA labels, focus states)
- Test with **high contrast mode**

### File Organization

```
app/
├── component/          # Reusable components
├── utils/             # Utility functions
├── types/             # TypeScript type definitions
├── hooks/             # Custom React hooks
└── constants/         # App constants
```

### Naming Conventions

- **Components**: PascalCase (`LeafDetector.tsx`)
- **Files**: kebab-case (`model-utils.ts`)
- **Variables**: camelCase (`imageUrl`, `boundingBoxes`)
- **Constants**: UPPER_SNAKE_CASE (`DISEASE_LABELS`)

## 🧪 Testing

### Manual Testing

Before submitting:

1. **Test the core functionality:**
   - Upload various image formats
   - Test with different image sizes
   - Verify bounding box positioning
   - Check confidence score accuracy

2. **Test PWA features:**
   - Install as PWA on mobile/desktop
   - Test offline functionality
   - Verify service worker caching

3. **Test across browsers:**
   - Chrome/Edge (primary)
   - Firefox
   - Safari (if possible)
   - Mobile browsers

4. **Test accessibility:**
   - Keyboard navigation
   - Screen reader compatibility
   - High contrast mode
   - Reduced motion preferences

### Performance Testing

- **Model loading time** (should be < 10 seconds on good connection)
- **Inference time** (should be < 3 seconds for typical images)
- **Memory usage** (watch for memory leaks)
- **Bundle size** (keep additions minimal)

## 🔧 Model Contributions

### Adding New Disease Classes

1. Update `DISEASE_LABELS` array in `LeafDetector.tsx`
2. Ensure your model outputs match the new class count
3. Test with sample images of the new diseases
4. Update documentation

### Model Optimization

- **Size optimization**: Prefer smaller models when accuracy is acceptable
- **Quantization**: INT8 quantization for web deployment
- **Format validation**: Ensure ONNX compatibility
- **Performance testing**: Benchmark inference times

## 📚 Documentation

### README Updates

When adding features:
- Update feature list
- Add new installation steps if needed
- Update usage instructions
- Include troubleshooting information

### Code Documentation

- **JSDoc comments** for functions and classes
- **Inline comments** for complex algorithms
- **README sections** for new major features
- **API documentation** for utility functions

## 🐛 Debugging Tips

### Common Issues

1. **Model loading fails:**
   - Check file path and permissions
   - Verify ONNX format
   - Monitor network requests in dev tools

2. **Poor detection accuracy:**
   - Validate input preprocessing
   - Check confidence thresholds
   - Verify class label mapping

3. **Performance issues:**
   - Profile with browser dev tools
   - Check for memory leaks
   - Monitor WebAssembly performance

### Debug Tools

- **Browser DevTools**: Performance, Memory, Network tabs
- **React DevTools**: Component state and props
- **Console logging**: Add temporary debug logs
- **ONNX.js debugging**: Enable verbose logging

## 🚢 Release Process

### Version Numbering

We use [Semantic Versioning](https://semver.org/):
- **MAJOR.MINOR.PATCH** (e.g., 1.2.3)
- **Major**: Breaking changes
- **Minor**: New features (backward compatible)
- **Patch**: Bug fixes

### Pull Request Process

1. **Ensure all checks pass** (TypeScript, build)
2. **Write clear commit messages**
3. **Update CHANGELOG.md** if applicable
4. **Request review** from maintainers
5. **Address review feedback**
6. **Squash commits** if requested

### Review Criteria

Pull requests will be evaluated on:

- **Code quality** and style consistency
- **Performance impact** (positive or neutral)
- **Security considerations** (especially for file handling)
- **Accessibility compliance**
- **Mobile compatibility**
- **Documentation completeness**

## 🤝 Community Guidelines

### Be Respectful

- Use inclusive language
- Respect different perspectives
- Be constructive in feedback
- Help newcomers learn

### Focus on Impact

- Prioritize user experience
- Consider performance implications
- Think about accessibility
- Maintain security standards

## 📞 Getting Help

- **Issues**: Create GitHub issues for bugs or questions
- **Discussions**: Use GitHub Discussions for general questions
- **Documentation**: Check README.md and MODEL_SPECS.md first

## 🏆 Recognition

Contributors will be:
- Listed in the project's README
- Mentioned in release notes for significant contributions
- Invited to join the core team for sustained contributions

## 📄 License

By contributing, you agree that your contributions will be licensed under the same MIT License that covers the project.

---

Thank you for contributing to making plant disease detection more accessible! 🌱
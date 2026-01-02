# Components

This directory contains reusable React components for the FIRST Global Team Kenya website.

## Structure

```
components/
├── auth/               # Authentication components
│   ├── AuthGuard.tsx   # Route protection
│   ├── LoginForm.tsx   # Login form
│   └── OTPInput.tsx    # OTP input component
├── dashboard/          # Dashboard components
│   ├── DashboardSidebar.tsx
│   └── ApplicationCard.tsx
├── forms/              # Form components
│   ├── application/    # Application form components
│   ├── ApplicationForm.tsx
│   └── FileUpload.tsx
├── ui/                 # Base UI components
│   ├── Button.tsx      # Button component
│   ├── Card.tsx        # Card component
│   ├── Input.tsx       # Input component
│   └── Modal.tsx       # Modal component
├── layout/             # Layout components
│   ├── Header.tsx      # Site header
│   ├── Footer.tsx      # Site footer
│   └── Sidebar.tsx     # Navigation sidebar
└── shared/             # Shared utilities
    ├── LoadingSpinner.tsx
    └── ErrorBoundary.tsx
```

## Component Categories

### Authentication Components (`auth/`)
Components for user authentication and authorization:
- Login/registration forms
- OTP input handling
- Route protection guards

### Dashboard Components (`dashboard/`)
User dashboard specific components:
- Navigation sidebars
- Application status cards
- Progress indicators

### Form Components (`forms/`)
Reusable form elements and complex forms:
- Application submission forms
- File upload components
- Form validation displays

### UI Components (`ui/`)
Base design system components:
- Buttons, inputs, cards
- Modals and overlays
- Loading states and feedback

### Layout Components (`layout/`)
Page layout and navigation components:
- Header with navigation
- Footer with links
- Responsive sidebars

## Component Guidelines

### Naming Convention
- PascalCase for component files: `Button.tsx`
- Descriptive names: `ApplicationForm.tsx`
- Directory structure by feature or type

### Props Interface
```tsx
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  onClick: () => void;
  disabled?: boolean;
}

function Button({ children, variant = 'primary', size = 'md', onClick, disabled }: ButtonProps) {
  // Implementation
}
```

### TypeScript Usage
- Strict typing for all props
- Proper generic constraints
- Interface definitions for complex objects
- Union types for variants

### Styling Approach
- Tailwind CSS for styling
- CSS variables for theming
- Responsive design utilities
- Dark mode support

### Accessibility
- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Screen reader compatibility

## Best Practices

### Component Composition
```tsx
// Prefer composition over complex props
<Card>
  <CardHeader>
    <h3>Application Status</h3>
  </CardHeader>
  <CardContent>
    <p>Your application is under review.</p>
  </CardContent>
</Card>
```

### Custom Hooks
```tsx
// Extract logic into custom hooks
function useApplicationForm() {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});

  const validate = () => {
    // Validation logic
  };

  const submit = async () => {
    // Submit logic
  };

  return { formData, setFormData, errors, validate, submit };
}
```

### Error Boundaries
```tsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}
```

## Testing Components

### Unit Tests
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button onClick={() => {}}>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Component Stories
```tsx
// Button.stories.tsx
import { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
};
```

## Performance Considerations

- Use `React.memo` for expensive components
- Implement proper key props for lists
- Lazy load heavy components
- Optimize re-renders with useMemo/useCallback

## Development Workflow

1. Create component file in appropriate directory
2. Implement component with TypeScript
3. Add unit tests
4. Create Storybook stories
5. Test across different screen sizes
6. Verify accessibility compliance
7. Update component documentation

## Adding New Components

1. Determine component category and location
2. Create component file with proper naming
3. Implement with TypeScript interfaces
4. Add comprehensive tests
5. Document props and usage
6. Update component index exports
import ResourceList from '../components/Resources/ResourceList';

export default function ResourcesPage() {
    return (
        <div className="animate-fade-in">
            {/* Page header */}
            <div className="mb-8">
                <h2
                    className="text-3xl md:text-4xl font-bold text-text-primary mb-3"
                    style={{ fontFamily: 'var(--font-serif)' }}
                >
                    You're Not Alone
                </h2>
                <p className="text-text-secondary leading-relaxed max-w-lg">
                    If anything you've written about resonates with these resources, please know that
                    help is available. Reaching out is brave, and you deserve support. 💕
                </p>
            </div>

            <ResourceList />
        </div>
    );
}

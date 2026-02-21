import ResourceList from "../components/Resources/ResourceList";

export default function ResourcesPage() {
  return (
    <>
      <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;600&display=swap');

                .rp-page {
                    max-width: 640px;
                    margin: 0 auto;
                    padding: 48px 20px 80px;
                }

                .rp-title {
                    font-family: 'Pixelify Sans', sans-serif;
                    font-size: 28px;
                    font-weight: 600;
                    color: #1a1a1a;
                    letter-spacing: 3px;
                    text-transform: uppercase;
                    margin-bottom: 10px;
                }

                .rp-subtitle {
                    font-family: 'Pixelify Sans', sans-serif;
                    font-size: 13px;
                    color: #a0788a;
                    line-height: 1.7;
                    margin-bottom: 36px;
                }
            `}</style>

      <div className="rp-page">
        <h1 className="rp-title">You're Not Alone</h1>
        {/* <p className="rp-subtitle">
          If anything you've written about resonates with these resources,
          please know that help is available. Reaching out is brave, and you
          deserve support.
        </p> */}
        <ResourceList />
      </div>
    </>
  );
}

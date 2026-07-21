import Layout from '../components/Layout';
import '../styles/home.css';

export default function Home() {
  return (
    <Layout>
      <div className="home-page">
        <div className="content-area home-placeholder">
          <h1>Ana Sayfa</h1>
          <p>
            Bu alan ana sayfa içeriği için hazır. Navbar ve footer sabit;
            buraya portal içeriklerini ekleyeceğiz.
          </p>
        </div>
      </div>
    </Layout>
  );
}

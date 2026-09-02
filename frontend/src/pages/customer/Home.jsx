import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const payWithEsewa = async () => {
    const { data } = await axios.post(
        "http://localhost:5000/api/payment/esewa/initiate",
        {
            amount: cartTotal
        }
    );

    const form = document.createElement("form");

    form.method = "POST";
    form.action =
        "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

    Object.entries({
        ...data
    }).forEach(([key, value]) => {
        const input =
            document.createElement("input");

        input.type = "hidden";
        input.name = key;
        input.value = value;

        form.appendChild(input);
    });

    document.body.appendChild(form);

    form.submit();
};

const Home = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="max-w-xl">
        {user ? (
          <p className="font-sans text-sm text-marigold-600">
            Logged in as {user.name} · {user.role.toLowerCase()}
          </p>
        ) : (
          <p className="font-sans text-sm text-indigo-600">Phase 1 · Foundations</p>
        )}

        <h1 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl">
          Momo, thali, chowmein — from kitchens near you.
        </h1>
        <p className="mt-4 font-sans text-ink/60">
          Restaurant browsing, search and ordering arrive in the next build phase
          (Section 25, Steps 4–8). Right now, this page confirms one thing:
          authentication and role-based routing are fully wired end to end.
        </p>

        {!user && (
          <div className="mt-8 flex gap-3">
            <Link
              to="/register"
              className="rounded-lg bg-indigo-600 px-5 py-2.5 font-sans text-sm text-paper hover:bg-indigo-700"
            >
              Create an account
            </Link>
            <Link
              to="/login"
              className="rounded-lg border border-ink/15 px-5 py-2.5 font-sans text-sm text-ink hover:border-ink/30"
            >
              Log in
            </Link>
          </div>
        )}
      </div>

      <div className="mt-16 grid gap-4 border-t border-ink/10 pt-10 sm:grid-cols-3">
        {[
          { title: 'Restaurant system', note: 'Step 4 — browsing, menus, categories' },
          { title: 'Cart & checkout', note: 'Steps 6–7 — address, coupons, fees' },
          { title: 'eSewa payments', note: 'Step 9 — verified against live docs' },
        ].map((item) => (
          <div key={item.title} className="border-l-2 border-marigold-500 pl-4">
            <p className="font-sans text-sm font-medium text-ink">{item.title}</p>
            <p className="mt-1 font-sans text-xs text-ink/50">{item.note}</p>
          </div>
        ))}
      </div>
    </div>
    
  );
};
<button onClick={payWithEsewa}>
    Pay with eSewa
</button>

export const esewaSuccess = async (req, res) => {
    console.log("eSewa success:", req.query);

    res.send(`
        <h1>Payment Successful</h1>
        <p>You can close this window.</p>
    `);
};

export const esewaFailure = async (req, res) => {
    console.log("eSewa failure:", req.query);

    res.send(`
        <h1>Payment Failed</h1>
    `);
};


export default Home;

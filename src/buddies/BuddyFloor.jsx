import './buddies.css';

/**
 * The floor line in the Home hero. The buddies themselves live in BuddyWorld
 * (app shell); this line is just one of the platforms they can stand on, and
 * the one they prefer whenever it's on screen.
 */
export default function BuddyFloor() {
  return (
    <div className="buddy-floor" aria-hidden="true">
      <div className="buddy-floor__stage" />
      <div className="buddy-floor__line" data-buddy-platform="floor">
        <span data-world="code" />
        <span data-world="create" />
        <span data-world="learn" />
        <span />
      </div>
    </div>
  );
}

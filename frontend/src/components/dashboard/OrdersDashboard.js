import React, { useEffect, useState } from 'react';

function Dashboard() {
  const [orders, setOrders] = useState([]);

  function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
  }

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
      console.log('Connected to the WebSocket Server');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (Array.isArray(data)) {
          console.log(data);
          setOrders(data);
        } else {
          console.log("Received non-array message:", data);
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div>
      <h2>Orders Dashboard</h2>
      <table>
        <thead>
          <tr>
            <th>Ordered</th>
            <th>Items</th>
            <th>Quantity</th>
            <th>Unit</th>
            <th>Due</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => order.items.map((item, itemIndex) => (
            <tr key={`${order.id}_${itemIndex}`}>
              {itemIndex === 0 ? (
                <>
                  <td rowSpan={order.items.length}>{formatTime(order.orderedAt)}</td>
                  <td>
                    {item.title}
                    <ul>
                      {item.options && item.options.map((option, optionIndex) => (
                        <li key={`${order.id}_${itemIndex}_${optionIndex}`}>
                          + {option.title}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>{item.quantity}</td>
                  <td rowSpan={order.items.length}>{order.deliveryAddress}</td>
                  <td rowSpan={order.items.length}>{order.deliveryTime}</td>
                </>
              ) : (
                <>
                  <td>
                    {item.title}
                    <ul>
                      {item.options && item.options.map((option, optionIndex) => (
                        <li key={`${order.id}_${itemIndex}_${optionIndex}`}>
                          + {option.title}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>{item.quantity}</td>
                </>
              )}
            </tr>
          )))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;

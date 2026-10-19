package com.hackmate.dto;

import java.util.List;

/**
 * Response of GET /requests/me.
 * incoming = invites sent to me + join requests to teams I lead.
 * outgoing = join requests I sent + invites I sent as leader.
 */
public record MyRequestsResponse(List<TeamRequestDto> incoming, List<TeamRequestDto> outgoing) {
}
